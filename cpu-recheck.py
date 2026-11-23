# TRAE 补测专用：只测 CPU 有效核数。必须存成文件再跑，不要粘贴到 stdin：
#   python3 cpu-recheck.py
import os, time, multiprocessing as mp
try:
    mp.set_start_method('fork', force=True)
except Exception:
    pass

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
        pool.map(burn, [end] * workers, chunksize=1)
    wall = time.perf_counter() - t0; c1 = os.times()
    cpu = (c1.user - c0.user) + (c1.system - c0.system) + \
          (c1.children_user - c0.children_user) + (c1.children_system - c0.children_system)
    return cpu / wall if wall else 0

if __name__ == '__main__':
    n = os.cpu_count() or 1
    single = measure(1)
    best = 0.0
    for _ in range(2):
        best = max(best, measure(n))
    print(f"CPU_SINGLE_THREAD = {single:.2f} cores")
    print(f"CPU_EFFECTIVE_CORES = {best:.2f}   (workers={n}, two rounds, best taken)")
