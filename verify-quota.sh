#!/usr/bin/env bash
# verify-quota.sh — 一键验真实配额（CPU / 内存 / 磁盘 / GPU）
# 用法: bash verify-quota.sh [--no-mem] [--mem-target GB]
# 原理: 不信 lscpu/free 的透出值。CPU 用满载实测有效核数；
#       内存用子进程逐步吃内存，被 OOM 杀掉也不影响主脚本；
#       cgroup 限额能读到就读，读不到以实测为准。
# 全程不需要 root、不装任何东西，只需要 bash + python3。

MEM_TEST=1
MEM_TARGET=""
while [ $# -gt 0 ]; do
  case "$1" in
    --no-mem) MEM_TEST=0 ;;
    --mem-target) MEM_TARGET="$2"; shift ;;
    *) echo "unknown arg: $1" ;;
  esac
  shift
done

OUT="/tmp/quota-report.txt"
[ -w "$(pwd)" ] && OUT="$(pwd)/quota-report.txt"
exec > >(tee "$OUT") 2>&1

hr(){ echo "------------------------------------------------------------"; }
echo "================ QUOTA REPORT ================"
echo "time: $(date '+%F %T %Z')"

hr; echo "[1] SYSTEM (透出值，仅供参考)"
uname -a 2>/dev/null
grep -E '^(PRETTY_NAME)=' /etc/os-release 2>/dev/null
echo "nproc: $(nproc 2>/dev/null || echo '?')  cpu_count: $(getconf _NPROCESSORS_ONLN 2>/dev/null || echo '?')"
lscpu 2>/dev/null | grep -E 'Model name|^CPU\(s\)|Thread|Core|Socket' || true
free -h 2>/dev/null || cat /proc/meminfo 2>/dev/null | head -3

hr; echo "[2] CGROUP LIMITS (能读到就是硬限额)"
echo "self cgroup: $(cat /proc/self/cgroup 2>/dev/null | tr '\n' ' ')"
found=0
for d in /sys/fs/cgroup /sys/fs/cgroup/cpu /sys/fs/cgroup/cpu,cpuacct /sys/fs/cgroup/memory /sys/fs/cgroup/unified; do
  [ -d "$d" ] || continue
  for f in cpu.max cpu.cfs_quota_us cpu.cfs_period_us memory.max memory.limit_in_bytes; do
    if [ -f "$d/$f" ]; then echo "$d/$f = $(cat "$d/$f" 2>/dev/null)"; found=1; fi
  done
done
[ "$found" = 0 ] && echo "(no readable cgroup cpu/memory limit — 以实测为准)"
grep -E 'nr_throttled|throttled_usec|throttled_time' /sys/fs/cgroup/cpu.stat /sys/fs/cgroup/cpu/cpu.stat 2>/dev/null || true
ulimit -a 2>/dev/null | grep -Ei 'cpu time|max memory|virtual memory' || true

hr; echo "[3] CPU EFFECTIVE CORES (满载实测 — 核心指标)"
if command -v python3 >/dev/null 2>&1; then
python3 - <<'PYEOF'
import os, time, multiprocessing as mp
def burn(end):
    x = 0
    while time.perf_counter() < end:
        for i in range(200000):
            x += i * i
    return x
def measure(workers, secs=5):
    end = time.perf_counter() + secs
    t0 = time.perf_counter(); c0 = os.times()
    with mp.Pool(workers) as pool:
        pool.map(burn, [end]*workers, chunksize=1)
    wall = time.perf_counter() - t0; c1 = os.times()
    cpu = (c1.user-c0.user)+(c1.system-c0.system)+(c1.children_user-c0.children_user)+(c1.children_system-c0.children_system)
    return cpu / wall if wall else 0
n = os.cpu_count() or 1
single = measure(1)
best = 0.0
for _ in range(2):
    best = max(best, measure(n))
print(f"CPU_SINGLE_THREAD = {single:.2f} cores")
print(f"CPU_EFFECTIVE_CORES = {best:.2f}   (workers={n}, two rounds, best taken)")
print("NOTE: shared hosts are noisy; treat this as approx, +/-0.3")
PYEOF
else
  echo "CPU_EFFECTIVE_CORES = UNKNOWN (no python3)"
fi

hr; echo "[4] MEMORY SURVIVABLE TEST (子进程吃内存，OOM 只杀子进程)"
if [ "$MEM_TEST" = 1 ] && command -v python3 >/dev/null 2>&1; then
python3 - "$MEM_TARGET" <<'PYEOF'
import subprocess, sys, time, re
target_arg = sys.argv[1]
# decide target: prove "big" with 16GB; for small boxes aim a bit above MemAvailable
avail_gb = 4.0
try:
    for line in open('/proc/meminfo'):
        if line.startswith('MemAvailable:'):
            avail_gb = int(line.split()[1]) / 1048576.0
except Exception:
    pass
target = float(target_arg) if target_arg else min(max(avail_gb + 3.0, 4.0), 16.0)
child_code = r'''
import sys, time
target_mb = int(float(sys.argv[1]) * 1024)
chunks = []
held = 0
step = 256
while held < target_mb:
    try:
        b = bytearray(step * 1024 * 1024)
        for i in range(0, len(b), 4096):
            b[i] = 1
        chunks.append(b)
        held += step
        print(f"HELD_MB {held}", flush=True)
    except MemoryError:
        print(f"MEMORY_ERROR_AT_MB {held}", flush=True)
        sys.exit(3)
print("SURVIVED_ALL", flush=True)
time.sleep(2)
'''
p = subprocess.Popen([sys.executable, '-c', child_code, str(target)],
                     stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
held = 0; survived = False; deadline = time.time() + 90
try:
    for line in p.stdout:
        if time.time() > deadline:
            p.kill(); break
        m = re.search(r'HELD_MB (\d+)', line)
        if m: held = int(m.group(1))
        if 'SURVIVED_ALL' in line: survived = True
        if 'MEMORY_ERROR' in line: break
    p.wait(timeout=10)
except Exception:
    p.kill()
print(f"MEM_TARGET_GB = {target:.1f}")
print(f"MEM_HELD_GB = {held/1024.0:.2f}")
print(f"MEM_SURVIVED_TARGET = {'YES' if survived else 'NO'}  (child exit={p.returncode}; -9/137 = OOM-killed at the real ceiling)")
PYEOF
else
  echo "MEM test skipped (--no-mem or no python3)"
fi

hr; echo "[5] DISK (df 只能看宿主机余量，真实配额除非写满无法验)"
for p in "$HOME" "$(pwd)" /tmp /workspace; do
  [ -d "$p" ] && df -h "$p" 2>/dev/null | tail -1 | awk -v p="$p" '{print p"  size="$2" used="$3" avail="$4" use%="$5}'
done
quota -s 2>/dev/null || true

hr; echo "[6] GPU / NETWORK"
if command -v nvidia-smi >/dev/null 2>&1; then nvidia-smi -L; else echo "GPU: none (no nvidia-smi)"; fi
ls /dev/nvidia* 2>/dev/null || echo "GPU dev: none"
if command -v curl >/dev/null 2>&1; then
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 6 https://example.com 2>/dev/null || echo FAIL)
  echo "network https://example.com -> $code"
else
  echo "network: curl missing, untested"
fi

hr; echo "[7] SUMMARY — 把从 [1] 到这里的完整输出原样发回，不要自行总结"
echo "END OF QUOTA REPORT (saved to $OUT if writable)"
