import csv
with open('results/pharmcat_results.tsv') as f:
    r = csv.DictReader(f, delimiter='\t')
    for row in r:
        if row['gene'] == 'IFNL3':
            print("Raw pheno:", repr(row['phenotype']))
            break
