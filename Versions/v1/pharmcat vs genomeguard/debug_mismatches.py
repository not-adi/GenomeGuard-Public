import pandas as pd
df = pd.read_csv('results/mismatches.tsv', sep='\t')
print("UGT1A1 mismatches:")
print(df[df.gene=='UGT1A1'][['gg_diplotype', 'pc_diplotype', 'gg_phenotype', 'pc_phenotype']])
