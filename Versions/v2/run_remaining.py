import time
import run_aldy
import run_pypgx
import generate_preprint
from concordance import run_concordance_analysis, run_performance_analysis

if __name__ == "__main__":
    t_start = time.time()
    
    # Step 5
    run_aldy.run(use_docker=True)
    
    # Step 6
    run_pypgx.run()
    
    # Step 7
    run_concordance_analysis()
    
    # Step 8
    run_performance_analysis()
    generate_preprint.generate()
    
    elapsed = time.time() - t_start
    print(f"Pipeline complete! Time taken: {elapsed:.1f}s")
