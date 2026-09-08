#!/bin/bash
mkdir -p /output/HG00096
if [ ! -d /output/HG00096/CYP2C19_out ]; then
  pypgx run-chip-pipeline CYP2C19 /output/HG00096/CYP2C19_out /input/HG00096.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00096/CYP2C9_out ]; then
  pypgx run-chip-pipeline CYP2C9 /output/HG00096/CYP2C9_out /input/HG00096.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00096/CYP3A4_out ]; then
  pypgx run-chip-pipeline CYP3A4 /output/HG00096/CYP3A4_out /input/HG00096.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00096/CYP3A5_out ]; then
  pypgx run-chip-pipeline CYP3A5 /output/HG00096/CYP3A5_out /input/HG00096.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00096/CYP2B6_out ]; then
  pypgx run-chip-pipeline CYP2B6 /output/HG00096/CYP2B6_out /input/HG00096.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00096/DPYD_out ]; then
  pypgx run-chip-pipeline DPYD /output/HG00096/DPYD_out /input/HG00096.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00096/TPMT_out ]; then
  pypgx run-chip-pipeline TPMT /output/HG00096/TPMT_out /input/HG00096.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00096/UGT1A1_out ]; then
  pypgx run-chip-pipeline UGT1A1 /output/HG00096/UGT1A1_out /input/HG00096.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00096/NUDT15_out ]; then
  pypgx run-chip-pipeline NUDT15 /output/HG00096/NUDT15_out /input/HG00096.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00096/CYP1A2_out ]; then
  pypgx run-chip-pipeline CYP1A2 /output/HG00096/CYP1A2_out /input/HG00096.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00096/CYP2C8_out ]; then
  pypgx run-chip-pipeline CYP2C8 /output/HG00096/CYP2C8_out /input/HG00096.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00096/NAT2_out ]; then
  pypgx run-chip-pipeline NAT2 /output/HG00096/NAT2_out /input/HG00096.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00096/SLCO1B1_out ]; then
  pypgx run-chip-pipeline SLCO1B1 /output/HG00096/SLCO1B1_out /input/HG00096.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00096/VKORC1_out ]; then
  pypgx run-chip-pipeline VKORC1 /output/HG00096/VKORC1_out /input/HG00096.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00096/IFNL3_out ]; then
  pypgx run-chip-pipeline IFNL3 /output/HG00096/IFNL3_out /input/HG00096.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00096/ABCG2_out ]; then
  pypgx run-chip-pipeline ABCG2 /output/HG00096/ABCG2_out /input/HG00096.vcf --assembly GRCh38 --force
fi
mkdir -p /output/HG00097
if [ ! -d /output/HG00097/CYP2C19_out ]; then
  pypgx run-chip-pipeline CYP2C19 /output/HG00097/CYP2C19_out /input/HG00097.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00097/CYP2C9_out ]; then
  pypgx run-chip-pipeline CYP2C9 /output/HG00097/CYP2C9_out /input/HG00097.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00097/CYP3A4_out ]; then
  pypgx run-chip-pipeline CYP3A4 /output/HG00097/CYP3A4_out /input/HG00097.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00097/CYP3A5_out ]; then
  pypgx run-chip-pipeline CYP3A5 /output/HG00097/CYP3A5_out /input/HG00097.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00097/CYP2B6_out ]; then
  pypgx run-chip-pipeline CYP2B6 /output/HG00097/CYP2B6_out /input/HG00097.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00097/DPYD_out ]; then
  pypgx run-chip-pipeline DPYD /output/HG00097/DPYD_out /input/HG00097.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00097/TPMT_out ]; then
  pypgx run-chip-pipeline TPMT /output/HG00097/TPMT_out /input/HG00097.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00097/UGT1A1_out ]; then
  pypgx run-chip-pipeline UGT1A1 /output/HG00097/UGT1A1_out /input/HG00097.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00097/NUDT15_out ]; then
  pypgx run-chip-pipeline NUDT15 /output/HG00097/NUDT15_out /input/HG00097.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00097/CYP1A2_out ]; then
  pypgx run-chip-pipeline CYP1A2 /output/HG00097/CYP1A2_out /input/HG00097.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00097/CYP2C8_out ]; then
  pypgx run-chip-pipeline CYP2C8 /output/HG00097/CYP2C8_out /input/HG00097.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00097/NAT2_out ]; then
  pypgx run-chip-pipeline NAT2 /output/HG00097/NAT2_out /input/HG00097.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00097/SLCO1B1_out ]; then
  pypgx run-chip-pipeline SLCO1B1 /output/HG00097/SLCO1B1_out /input/HG00097.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00097/VKORC1_out ]; then
  pypgx run-chip-pipeline VKORC1 /output/HG00097/VKORC1_out /input/HG00097.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00097/IFNL3_out ]; then
  pypgx run-chip-pipeline IFNL3 /output/HG00097/IFNL3_out /input/HG00097.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00097/ABCG2_out ]; then
  pypgx run-chip-pipeline ABCG2 /output/HG00097/ABCG2_out /input/HG00097.vcf --assembly GRCh38 --force
fi
mkdir -p /output/HG00099
if [ ! -d /output/HG00099/CYP2C19_out ]; then
  pypgx run-chip-pipeline CYP2C19 /output/HG00099/CYP2C19_out /input/HG00099.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00099/CYP2C9_out ]; then
  pypgx run-chip-pipeline CYP2C9 /output/HG00099/CYP2C9_out /input/HG00099.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00099/CYP3A4_out ]; then
  pypgx run-chip-pipeline CYP3A4 /output/HG00099/CYP3A4_out /input/HG00099.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00099/CYP3A5_out ]; then
  pypgx run-chip-pipeline CYP3A5 /output/HG00099/CYP3A5_out /input/HG00099.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00099/CYP2B6_out ]; then
  pypgx run-chip-pipeline CYP2B6 /output/HG00099/CYP2B6_out /input/HG00099.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00099/DPYD_out ]; then
  pypgx run-chip-pipeline DPYD /output/HG00099/DPYD_out /input/HG00099.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00099/TPMT_out ]; then
  pypgx run-chip-pipeline TPMT /output/HG00099/TPMT_out /input/HG00099.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00099/UGT1A1_out ]; then
  pypgx run-chip-pipeline UGT1A1 /output/HG00099/UGT1A1_out /input/HG00099.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00099/NUDT15_out ]; then
  pypgx run-chip-pipeline NUDT15 /output/HG00099/NUDT15_out /input/HG00099.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00099/CYP1A2_out ]; then
  pypgx run-chip-pipeline CYP1A2 /output/HG00099/CYP1A2_out /input/HG00099.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00099/CYP2C8_out ]; then
  pypgx run-chip-pipeline CYP2C8 /output/HG00099/CYP2C8_out /input/HG00099.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00099/NAT2_out ]; then
  pypgx run-chip-pipeline NAT2 /output/HG00099/NAT2_out /input/HG00099.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00099/SLCO1B1_out ]; then
  pypgx run-chip-pipeline SLCO1B1 /output/HG00099/SLCO1B1_out /input/HG00099.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00099/VKORC1_out ]; then
  pypgx run-chip-pipeline VKORC1 /output/HG00099/VKORC1_out /input/HG00099.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00099/IFNL3_out ]; then
  pypgx run-chip-pipeline IFNL3 /output/HG00099/IFNL3_out /input/HG00099.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00099/ABCG2_out ]; then
  pypgx run-chip-pipeline ABCG2 /output/HG00099/ABCG2_out /input/HG00099.vcf --assembly GRCh38 --force
fi
mkdir -p /output/HG00100
if [ ! -d /output/HG00100/CYP2C19_out ]; then
  pypgx run-chip-pipeline CYP2C19 /output/HG00100/CYP2C19_out /input/HG00100.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00100/CYP2C9_out ]; then
  pypgx run-chip-pipeline CYP2C9 /output/HG00100/CYP2C9_out /input/HG00100.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00100/CYP3A4_out ]; then
  pypgx run-chip-pipeline CYP3A4 /output/HG00100/CYP3A4_out /input/HG00100.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00100/CYP3A5_out ]; then
  pypgx run-chip-pipeline CYP3A5 /output/HG00100/CYP3A5_out /input/HG00100.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00100/CYP2B6_out ]; then
  pypgx run-chip-pipeline CYP2B6 /output/HG00100/CYP2B6_out /input/HG00100.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00100/DPYD_out ]; then
  pypgx run-chip-pipeline DPYD /output/HG00100/DPYD_out /input/HG00100.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00100/TPMT_out ]; then
  pypgx run-chip-pipeline TPMT /output/HG00100/TPMT_out /input/HG00100.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00100/UGT1A1_out ]; then
  pypgx run-chip-pipeline UGT1A1 /output/HG00100/UGT1A1_out /input/HG00100.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00100/NUDT15_out ]; then
  pypgx run-chip-pipeline NUDT15 /output/HG00100/NUDT15_out /input/HG00100.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00100/CYP1A2_out ]; then
  pypgx run-chip-pipeline CYP1A2 /output/HG00100/CYP1A2_out /input/HG00100.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00100/CYP2C8_out ]; then
  pypgx run-chip-pipeline CYP2C8 /output/HG00100/CYP2C8_out /input/HG00100.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00100/NAT2_out ]; then
  pypgx run-chip-pipeline NAT2 /output/HG00100/NAT2_out /input/HG00100.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00100/SLCO1B1_out ]; then
  pypgx run-chip-pipeline SLCO1B1 /output/HG00100/SLCO1B1_out /input/HG00100.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00100/VKORC1_out ]; then
  pypgx run-chip-pipeline VKORC1 /output/HG00100/VKORC1_out /input/HG00100.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00100/IFNL3_out ]; then
  pypgx run-chip-pipeline IFNL3 /output/HG00100/IFNL3_out /input/HG00100.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00100/ABCG2_out ]; then
  pypgx run-chip-pipeline ABCG2 /output/HG00100/ABCG2_out /input/HG00100.vcf --assembly GRCh38 --force
fi
mkdir -p /output/HG00101
if [ ! -d /output/HG00101/CYP2C19_out ]; then
  pypgx run-chip-pipeline CYP2C19 /output/HG00101/CYP2C19_out /input/HG00101.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00101/CYP2C9_out ]; then
  pypgx run-chip-pipeline CYP2C9 /output/HG00101/CYP2C9_out /input/HG00101.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00101/CYP3A4_out ]; then
  pypgx run-chip-pipeline CYP3A4 /output/HG00101/CYP3A4_out /input/HG00101.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00101/CYP3A5_out ]; then
  pypgx run-chip-pipeline CYP3A5 /output/HG00101/CYP3A5_out /input/HG00101.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00101/CYP2B6_out ]; then
  pypgx run-chip-pipeline CYP2B6 /output/HG00101/CYP2B6_out /input/HG00101.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00101/DPYD_out ]; then
  pypgx run-chip-pipeline DPYD /output/HG00101/DPYD_out /input/HG00101.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00101/TPMT_out ]; then
  pypgx run-chip-pipeline TPMT /output/HG00101/TPMT_out /input/HG00101.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00101/UGT1A1_out ]; then
  pypgx run-chip-pipeline UGT1A1 /output/HG00101/UGT1A1_out /input/HG00101.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00101/NUDT15_out ]; then
  pypgx run-chip-pipeline NUDT15 /output/HG00101/NUDT15_out /input/HG00101.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00101/CYP1A2_out ]; then
  pypgx run-chip-pipeline CYP1A2 /output/HG00101/CYP1A2_out /input/HG00101.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00101/CYP2C8_out ]; then
  pypgx run-chip-pipeline CYP2C8 /output/HG00101/CYP2C8_out /input/HG00101.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00101/NAT2_out ]; then
  pypgx run-chip-pipeline NAT2 /output/HG00101/NAT2_out /input/HG00101.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00101/SLCO1B1_out ]; then
  pypgx run-chip-pipeline SLCO1B1 /output/HG00101/SLCO1B1_out /input/HG00101.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00101/VKORC1_out ]; then
  pypgx run-chip-pipeline VKORC1 /output/HG00101/VKORC1_out /input/HG00101.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00101/IFNL3_out ]; then
  pypgx run-chip-pipeline IFNL3 /output/HG00101/IFNL3_out /input/HG00101.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00101/ABCG2_out ]; then
  pypgx run-chip-pipeline ABCG2 /output/HG00101/ABCG2_out /input/HG00101.vcf --assembly GRCh38 --force
fi
mkdir -p /output/HG00403
if [ ! -d /output/HG00403/CYP2C19_out ]; then
  pypgx run-chip-pipeline CYP2C19 /output/HG00403/CYP2C19_out /input/HG00403.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00403/CYP2C9_out ]; then
  pypgx run-chip-pipeline CYP2C9 /output/HG00403/CYP2C9_out /input/HG00403.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00403/CYP3A4_out ]; then
  pypgx run-chip-pipeline CYP3A4 /output/HG00403/CYP3A4_out /input/HG00403.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00403/CYP3A5_out ]; then
  pypgx run-chip-pipeline CYP3A5 /output/HG00403/CYP3A5_out /input/HG00403.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00403/CYP2B6_out ]; then
  pypgx run-chip-pipeline CYP2B6 /output/HG00403/CYP2B6_out /input/HG00403.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00403/DPYD_out ]; then
  pypgx run-chip-pipeline DPYD /output/HG00403/DPYD_out /input/HG00403.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00403/TPMT_out ]; then
  pypgx run-chip-pipeline TPMT /output/HG00403/TPMT_out /input/HG00403.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00403/UGT1A1_out ]; then
  pypgx run-chip-pipeline UGT1A1 /output/HG00403/UGT1A1_out /input/HG00403.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00403/NUDT15_out ]; then
  pypgx run-chip-pipeline NUDT15 /output/HG00403/NUDT15_out /input/HG00403.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00403/CYP1A2_out ]; then
  pypgx run-chip-pipeline CYP1A2 /output/HG00403/CYP1A2_out /input/HG00403.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00403/CYP2C8_out ]; then
  pypgx run-chip-pipeline CYP2C8 /output/HG00403/CYP2C8_out /input/HG00403.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00403/NAT2_out ]; then
  pypgx run-chip-pipeline NAT2 /output/HG00403/NAT2_out /input/HG00403.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00403/SLCO1B1_out ]; then
  pypgx run-chip-pipeline SLCO1B1 /output/HG00403/SLCO1B1_out /input/HG00403.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00403/VKORC1_out ]; then
  pypgx run-chip-pipeline VKORC1 /output/HG00403/VKORC1_out /input/HG00403.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00403/IFNL3_out ]; then
  pypgx run-chip-pipeline IFNL3 /output/HG00403/IFNL3_out /input/HG00403.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00403/ABCG2_out ]; then
  pypgx run-chip-pipeline ABCG2 /output/HG00403/ABCG2_out /input/HG00403.vcf --assembly GRCh38 --force
fi
mkdir -p /output/HG00404
if [ ! -d /output/HG00404/CYP2C19_out ]; then
  pypgx run-chip-pipeline CYP2C19 /output/HG00404/CYP2C19_out /input/HG00404.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00404/CYP2C9_out ]; then
  pypgx run-chip-pipeline CYP2C9 /output/HG00404/CYP2C9_out /input/HG00404.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00404/CYP3A4_out ]; then
  pypgx run-chip-pipeline CYP3A4 /output/HG00404/CYP3A4_out /input/HG00404.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00404/CYP3A5_out ]; then
  pypgx run-chip-pipeline CYP3A5 /output/HG00404/CYP3A5_out /input/HG00404.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00404/CYP2B6_out ]; then
  pypgx run-chip-pipeline CYP2B6 /output/HG00404/CYP2B6_out /input/HG00404.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00404/DPYD_out ]; then
  pypgx run-chip-pipeline DPYD /output/HG00404/DPYD_out /input/HG00404.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00404/TPMT_out ]; then
  pypgx run-chip-pipeline TPMT /output/HG00404/TPMT_out /input/HG00404.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00404/UGT1A1_out ]; then
  pypgx run-chip-pipeline UGT1A1 /output/HG00404/UGT1A1_out /input/HG00404.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00404/NUDT15_out ]; then
  pypgx run-chip-pipeline NUDT15 /output/HG00404/NUDT15_out /input/HG00404.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00404/CYP1A2_out ]; then
  pypgx run-chip-pipeline CYP1A2 /output/HG00404/CYP1A2_out /input/HG00404.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00404/CYP2C8_out ]; then
  pypgx run-chip-pipeline CYP2C8 /output/HG00404/CYP2C8_out /input/HG00404.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00404/NAT2_out ]; then
  pypgx run-chip-pipeline NAT2 /output/HG00404/NAT2_out /input/HG00404.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00404/SLCO1B1_out ]; then
  pypgx run-chip-pipeline SLCO1B1 /output/HG00404/SLCO1B1_out /input/HG00404.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00404/VKORC1_out ]; then
  pypgx run-chip-pipeline VKORC1 /output/HG00404/VKORC1_out /input/HG00404.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00404/IFNL3_out ]; then
  pypgx run-chip-pipeline IFNL3 /output/HG00404/IFNL3_out /input/HG00404.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00404/ABCG2_out ]; then
  pypgx run-chip-pipeline ABCG2 /output/HG00404/ABCG2_out /input/HG00404.vcf --assembly GRCh38 --force
fi
mkdir -p /output/HG00405
if [ ! -d /output/HG00405/CYP2C19_out ]; then
  pypgx run-chip-pipeline CYP2C19 /output/HG00405/CYP2C19_out /input/HG00405.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00405/CYP2C9_out ]; then
  pypgx run-chip-pipeline CYP2C9 /output/HG00405/CYP2C9_out /input/HG00405.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00405/CYP3A4_out ]; then
  pypgx run-chip-pipeline CYP3A4 /output/HG00405/CYP3A4_out /input/HG00405.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00405/CYP3A5_out ]; then
  pypgx run-chip-pipeline CYP3A5 /output/HG00405/CYP3A5_out /input/HG00405.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00405/CYP2B6_out ]; then
  pypgx run-chip-pipeline CYP2B6 /output/HG00405/CYP2B6_out /input/HG00405.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00405/DPYD_out ]; then
  pypgx run-chip-pipeline DPYD /output/HG00405/DPYD_out /input/HG00405.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00405/TPMT_out ]; then
  pypgx run-chip-pipeline TPMT /output/HG00405/TPMT_out /input/HG00405.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00405/UGT1A1_out ]; then
  pypgx run-chip-pipeline UGT1A1 /output/HG00405/UGT1A1_out /input/HG00405.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00405/NUDT15_out ]; then
  pypgx run-chip-pipeline NUDT15 /output/HG00405/NUDT15_out /input/HG00405.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00405/CYP1A2_out ]; then
  pypgx run-chip-pipeline CYP1A2 /output/HG00405/CYP1A2_out /input/HG00405.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00405/CYP2C8_out ]; then
  pypgx run-chip-pipeline CYP2C8 /output/HG00405/CYP2C8_out /input/HG00405.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00405/NAT2_out ]; then
  pypgx run-chip-pipeline NAT2 /output/HG00405/NAT2_out /input/HG00405.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00405/SLCO1B1_out ]; then
  pypgx run-chip-pipeline SLCO1B1 /output/HG00405/SLCO1B1_out /input/HG00405.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00405/VKORC1_out ]; then
  pypgx run-chip-pipeline VKORC1 /output/HG00405/VKORC1_out /input/HG00405.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00405/IFNL3_out ]; then
  pypgx run-chip-pipeline IFNL3 /output/HG00405/IFNL3_out /input/HG00405.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00405/ABCG2_out ]; then
  pypgx run-chip-pipeline ABCG2 /output/HG00405/ABCG2_out /input/HG00405.vcf --assembly GRCh38 --force
fi
mkdir -p /output/HG00406
if [ ! -d /output/HG00406/CYP2C19_out ]; then
  pypgx run-chip-pipeline CYP2C19 /output/HG00406/CYP2C19_out /input/HG00406.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00406/CYP2C9_out ]; then
  pypgx run-chip-pipeline CYP2C9 /output/HG00406/CYP2C9_out /input/HG00406.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00406/CYP3A4_out ]; then
  pypgx run-chip-pipeline CYP3A4 /output/HG00406/CYP3A4_out /input/HG00406.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00406/CYP3A5_out ]; then
  pypgx run-chip-pipeline CYP3A5 /output/HG00406/CYP3A5_out /input/HG00406.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00406/CYP2B6_out ]; then
  pypgx run-chip-pipeline CYP2B6 /output/HG00406/CYP2B6_out /input/HG00406.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00406/DPYD_out ]; then
  pypgx run-chip-pipeline DPYD /output/HG00406/DPYD_out /input/HG00406.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00406/TPMT_out ]; then
  pypgx run-chip-pipeline TPMT /output/HG00406/TPMT_out /input/HG00406.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00406/UGT1A1_out ]; then
  pypgx run-chip-pipeline UGT1A1 /output/HG00406/UGT1A1_out /input/HG00406.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00406/NUDT15_out ]; then
  pypgx run-chip-pipeline NUDT15 /output/HG00406/NUDT15_out /input/HG00406.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00406/CYP1A2_out ]; then
  pypgx run-chip-pipeline CYP1A2 /output/HG00406/CYP1A2_out /input/HG00406.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00406/CYP2C8_out ]; then
  pypgx run-chip-pipeline CYP2C8 /output/HG00406/CYP2C8_out /input/HG00406.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00406/NAT2_out ]; then
  pypgx run-chip-pipeline NAT2 /output/HG00406/NAT2_out /input/HG00406.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00406/SLCO1B1_out ]; then
  pypgx run-chip-pipeline SLCO1B1 /output/HG00406/SLCO1B1_out /input/HG00406.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00406/VKORC1_out ]; then
  pypgx run-chip-pipeline VKORC1 /output/HG00406/VKORC1_out /input/HG00406.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00406/IFNL3_out ]; then
  pypgx run-chip-pipeline IFNL3 /output/HG00406/IFNL3_out /input/HG00406.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00406/ABCG2_out ]; then
  pypgx run-chip-pipeline ABCG2 /output/HG00406/ABCG2_out /input/HG00406.vcf --assembly GRCh38 --force
fi
mkdir -p /output/HG00407
if [ ! -d /output/HG00407/CYP2C19_out ]; then
  pypgx run-chip-pipeline CYP2C19 /output/HG00407/CYP2C19_out /input/HG00407.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00407/CYP2C9_out ]; then
  pypgx run-chip-pipeline CYP2C9 /output/HG00407/CYP2C9_out /input/HG00407.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00407/CYP3A4_out ]; then
  pypgx run-chip-pipeline CYP3A4 /output/HG00407/CYP3A4_out /input/HG00407.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00407/CYP3A5_out ]; then
  pypgx run-chip-pipeline CYP3A5 /output/HG00407/CYP3A5_out /input/HG00407.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00407/CYP2B6_out ]; then
  pypgx run-chip-pipeline CYP2B6 /output/HG00407/CYP2B6_out /input/HG00407.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00407/DPYD_out ]; then
  pypgx run-chip-pipeline DPYD /output/HG00407/DPYD_out /input/HG00407.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00407/TPMT_out ]; then
  pypgx run-chip-pipeline TPMT /output/HG00407/TPMT_out /input/HG00407.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00407/UGT1A1_out ]; then
  pypgx run-chip-pipeline UGT1A1 /output/HG00407/UGT1A1_out /input/HG00407.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00407/NUDT15_out ]; then
  pypgx run-chip-pipeline NUDT15 /output/HG00407/NUDT15_out /input/HG00407.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00407/CYP1A2_out ]; then
  pypgx run-chip-pipeline CYP1A2 /output/HG00407/CYP1A2_out /input/HG00407.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00407/CYP2C8_out ]; then
  pypgx run-chip-pipeline CYP2C8 /output/HG00407/CYP2C8_out /input/HG00407.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00407/NAT2_out ]; then
  pypgx run-chip-pipeline NAT2 /output/HG00407/NAT2_out /input/HG00407.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00407/SLCO1B1_out ]; then
  pypgx run-chip-pipeline SLCO1B1 /output/HG00407/SLCO1B1_out /input/HG00407.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00407/VKORC1_out ]; then
  pypgx run-chip-pipeline VKORC1 /output/HG00407/VKORC1_out /input/HG00407.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00407/IFNL3_out ]; then
  pypgx run-chip-pipeline IFNL3 /output/HG00407/IFNL3_out /input/HG00407.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00407/ABCG2_out ]; then
  pypgx run-chip-pipeline ABCG2 /output/HG00407/ABCG2_out /input/HG00407.vcf --assembly GRCh38 --force
fi
mkdir -p /output/HG00551
if [ ! -d /output/HG00551/CYP2C19_out ]; then
  pypgx run-chip-pipeline CYP2C19 /output/HG00551/CYP2C19_out /input/HG00551.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00551/CYP2C9_out ]; then
  pypgx run-chip-pipeline CYP2C9 /output/HG00551/CYP2C9_out /input/HG00551.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00551/CYP3A4_out ]; then
  pypgx run-chip-pipeline CYP3A4 /output/HG00551/CYP3A4_out /input/HG00551.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00551/CYP3A5_out ]; then
  pypgx run-chip-pipeline CYP3A5 /output/HG00551/CYP3A5_out /input/HG00551.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00551/CYP2B6_out ]; then
  pypgx run-chip-pipeline CYP2B6 /output/HG00551/CYP2B6_out /input/HG00551.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00551/DPYD_out ]; then
  pypgx run-chip-pipeline DPYD /output/HG00551/DPYD_out /input/HG00551.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00551/TPMT_out ]; then
  pypgx run-chip-pipeline TPMT /output/HG00551/TPMT_out /input/HG00551.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00551/UGT1A1_out ]; then
  pypgx run-chip-pipeline UGT1A1 /output/HG00551/UGT1A1_out /input/HG00551.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00551/NUDT15_out ]; then
  pypgx run-chip-pipeline NUDT15 /output/HG00551/NUDT15_out /input/HG00551.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00551/CYP1A2_out ]; then
  pypgx run-chip-pipeline CYP1A2 /output/HG00551/CYP1A2_out /input/HG00551.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00551/CYP2C8_out ]; then
  pypgx run-chip-pipeline CYP2C8 /output/HG00551/CYP2C8_out /input/HG00551.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00551/NAT2_out ]; then
  pypgx run-chip-pipeline NAT2 /output/HG00551/NAT2_out /input/HG00551.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00551/SLCO1B1_out ]; then
  pypgx run-chip-pipeline SLCO1B1 /output/HG00551/SLCO1B1_out /input/HG00551.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00551/VKORC1_out ]; then
  pypgx run-chip-pipeline VKORC1 /output/HG00551/VKORC1_out /input/HG00551.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00551/IFNL3_out ]; then
  pypgx run-chip-pipeline IFNL3 /output/HG00551/IFNL3_out /input/HG00551.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00551/ABCG2_out ]; then
  pypgx run-chip-pipeline ABCG2 /output/HG00551/ABCG2_out /input/HG00551.vcf --assembly GRCh38 --force
fi
mkdir -p /output/HG00552
if [ ! -d /output/HG00552/CYP2C19_out ]; then
  pypgx run-chip-pipeline CYP2C19 /output/HG00552/CYP2C19_out /input/HG00552.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00552/CYP2C9_out ]; then
  pypgx run-chip-pipeline CYP2C9 /output/HG00552/CYP2C9_out /input/HG00552.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00552/CYP3A4_out ]; then
  pypgx run-chip-pipeline CYP3A4 /output/HG00552/CYP3A4_out /input/HG00552.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00552/CYP3A5_out ]; then
  pypgx run-chip-pipeline CYP3A5 /output/HG00552/CYP3A5_out /input/HG00552.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00552/CYP2B6_out ]; then
  pypgx run-chip-pipeline CYP2B6 /output/HG00552/CYP2B6_out /input/HG00552.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00552/DPYD_out ]; then
  pypgx run-chip-pipeline DPYD /output/HG00552/DPYD_out /input/HG00552.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00552/TPMT_out ]; then
  pypgx run-chip-pipeline TPMT /output/HG00552/TPMT_out /input/HG00552.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00552/UGT1A1_out ]; then
  pypgx run-chip-pipeline UGT1A1 /output/HG00552/UGT1A1_out /input/HG00552.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00552/NUDT15_out ]; then
  pypgx run-chip-pipeline NUDT15 /output/HG00552/NUDT15_out /input/HG00552.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00552/CYP1A2_out ]; then
  pypgx run-chip-pipeline CYP1A2 /output/HG00552/CYP1A2_out /input/HG00552.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00552/CYP2C8_out ]; then
  pypgx run-chip-pipeline CYP2C8 /output/HG00552/CYP2C8_out /input/HG00552.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00552/NAT2_out ]; then
  pypgx run-chip-pipeline NAT2 /output/HG00552/NAT2_out /input/HG00552.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00552/SLCO1B1_out ]; then
  pypgx run-chip-pipeline SLCO1B1 /output/HG00552/SLCO1B1_out /input/HG00552.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00552/VKORC1_out ]; then
  pypgx run-chip-pipeline VKORC1 /output/HG00552/VKORC1_out /input/HG00552.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00552/IFNL3_out ]; then
  pypgx run-chip-pipeline IFNL3 /output/HG00552/IFNL3_out /input/HG00552.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00552/ABCG2_out ]; then
  pypgx run-chip-pipeline ABCG2 /output/HG00552/ABCG2_out /input/HG00552.vcf --assembly GRCh38 --force
fi
mkdir -p /output/HG00553
if [ ! -d /output/HG00553/CYP2C19_out ]; then
  pypgx run-chip-pipeline CYP2C19 /output/HG00553/CYP2C19_out /input/HG00553.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00553/CYP2C9_out ]; then
  pypgx run-chip-pipeline CYP2C9 /output/HG00553/CYP2C9_out /input/HG00553.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00553/CYP3A4_out ]; then
  pypgx run-chip-pipeline CYP3A4 /output/HG00553/CYP3A4_out /input/HG00553.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00553/CYP3A5_out ]; then
  pypgx run-chip-pipeline CYP3A5 /output/HG00553/CYP3A5_out /input/HG00553.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00553/CYP2B6_out ]; then
  pypgx run-chip-pipeline CYP2B6 /output/HG00553/CYP2B6_out /input/HG00553.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00553/DPYD_out ]; then
  pypgx run-chip-pipeline DPYD /output/HG00553/DPYD_out /input/HG00553.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00553/TPMT_out ]; then
  pypgx run-chip-pipeline TPMT /output/HG00553/TPMT_out /input/HG00553.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00553/UGT1A1_out ]; then
  pypgx run-chip-pipeline UGT1A1 /output/HG00553/UGT1A1_out /input/HG00553.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00553/NUDT15_out ]; then
  pypgx run-chip-pipeline NUDT15 /output/HG00553/NUDT15_out /input/HG00553.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00553/CYP1A2_out ]; then
  pypgx run-chip-pipeline CYP1A2 /output/HG00553/CYP1A2_out /input/HG00553.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00553/CYP2C8_out ]; then
  pypgx run-chip-pipeline CYP2C8 /output/HG00553/CYP2C8_out /input/HG00553.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00553/NAT2_out ]; then
  pypgx run-chip-pipeline NAT2 /output/HG00553/NAT2_out /input/HG00553.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00553/SLCO1B1_out ]; then
  pypgx run-chip-pipeline SLCO1B1 /output/HG00553/SLCO1B1_out /input/HG00553.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00553/VKORC1_out ]; then
  pypgx run-chip-pipeline VKORC1 /output/HG00553/VKORC1_out /input/HG00553.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00553/IFNL3_out ]; then
  pypgx run-chip-pipeline IFNL3 /output/HG00553/IFNL3_out /input/HG00553.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00553/ABCG2_out ]; then
  pypgx run-chip-pipeline ABCG2 /output/HG00553/ABCG2_out /input/HG00553.vcf --assembly GRCh38 --force
fi
mkdir -p /output/HG00554
if [ ! -d /output/HG00554/CYP2C19_out ]; then
  pypgx run-chip-pipeline CYP2C19 /output/HG00554/CYP2C19_out /input/HG00554.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00554/CYP2C9_out ]; then
  pypgx run-chip-pipeline CYP2C9 /output/HG00554/CYP2C9_out /input/HG00554.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00554/CYP3A4_out ]; then
  pypgx run-chip-pipeline CYP3A4 /output/HG00554/CYP3A4_out /input/HG00554.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00554/CYP3A5_out ]; then
  pypgx run-chip-pipeline CYP3A5 /output/HG00554/CYP3A5_out /input/HG00554.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00554/CYP2B6_out ]; then
  pypgx run-chip-pipeline CYP2B6 /output/HG00554/CYP2B6_out /input/HG00554.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00554/DPYD_out ]; then
  pypgx run-chip-pipeline DPYD /output/HG00554/DPYD_out /input/HG00554.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00554/TPMT_out ]; then
  pypgx run-chip-pipeline TPMT /output/HG00554/TPMT_out /input/HG00554.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00554/UGT1A1_out ]; then
  pypgx run-chip-pipeline UGT1A1 /output/HG00554/UGT1A1_out /input/HG00554.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00554/NUDT15_out ]; then
  pypgx run-chip-pipeline NUDT15 /output/HG00554/NUDT15_out /input/HG00554.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00554/CYP1A2_out ]; then
  pypgx run-chip-pipeline CYP1A2 /output/HG00554/CYP1A2_out /input/HG00554.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00554/CYP2C8_out ]; then
  pypgx run-chip-pipeline CYP2C8 /output/HG00554/CYP2C8_out /input/HG00554.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00554/NAT2_out ]; then
  pypgx run-chip-pipeline NAT2 /output/HG00554/NAT2_out /input/HG00554.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00554/SLCO1B1_out ]; then
  pypgx run-chip-pipeline SLCO1B1 /output/HG00554/SLCO1B1_out /input/HG00554.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00554/VKORC1_out ]; then
  pypgx run-chip-pipeline VKORC1 /output/HG00554/VKORC1_out /input/HG00554.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00554/IFNL3_out ]; then
  pypgx run-chip-pipeline IFNL3 /output/HG00554/IFNL3_out /input/HG00554.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00554/ABCG2_out ]; then
  pypgx run-chip-pipeline ABCG2 /output/HG00554/ABCG2_out /input/HG00554.vcf --assembly GRCh38 --force
fi
mkdir -p /output/HG00555
if [ ! -d /output/HG00555/CYP2C19_out ]; then
  pypgx run-chip-pipeline CYP2C19 /output/HG00555/CYP2C19_out /input/HG00555.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00555/CYP2C9_out ]; then
  pypgx run-chip-pipeline CYP2C9 /output/HG00555/CYP2C9_out /input/HG00555.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00555/CYP3A4_out ]; then
  pypgx run-chip-pipeline CYP3A4 /output/HG00555/CYP3A4_out /input/HG00555.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00555/CYP3A5_out ]; then
  pypgx run-chip-pipeline CYP3A5 /output/HG00555/CYP3A5_out /input/HG00555.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00555/CYP2B6_out ]; then
  pypgx run-chip-pipeline CYP2B6 /output/HG00555/CYP2B6_out /input/HG00555.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00555/DPYD_out ]; then
  pypgx run-chip-pipeline DPYD /output/HG00555/DPYD_out /input/HG00555.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00555/TPMT_out ]; then
  pypgx run-chip-pipeline TPMT /output/HG00555/TPMT_out /input/HG00555.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00555/UGT1A1_out ]; then
  pypgx run-chip-pipeline UGT1A1 /output/HG00555/UGT1A1_out /input/HG00555.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00555/NUDT15_out ]; then
  pypgx run-chip-pipeline NUDT15 /output/HG00555/NUDT15_out /input/HG00555.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00555/CYP1A2_out ]; then
  pypgx run-chip-pipeline CYP1A2 /output/HG00555/CYP1A2_out /input/HG00555.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00555/CYP2C8_out ]; then
  pypgx run-chip-pipeline CYP2C8 /output/HG00555/CYP2C8_out /input/HG00555.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00555/NAT2_out ]; then
  pypgx run-chip-pipeline NAT2 /output/HG00555/NAT2_out /input/HG00555.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00555/SLCO1B1_out ]; then
  pypgx run-chip-pipeline SLCO1B1 /output/HG00555/SLCO1B1_out /input/HG00555.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00555/VKORC1_out ]; then
  pypgx run-chip-pipeline VKORC1 /output/HG00555/VKORC1_out /input/HG00555.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00555/IFNL3_out ]; then
  pypgx run-chip-pipeline IFNL3 /output/HG00555/IFNL3_out /input/HG00555.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG00555/ABCG2_out ]; then
  pypgx run-chip-pipeline ABCG2 /output/HG00555/ABCG2_out /input/HG00555.vcf --assembly GRCh38 --force
fi
mkdir -p /output/HG01879
if [ ! -d /output/HG01879/CYP2C19_out ]; then
  pypgx run-chip-pipeline CYP2C19 /output/HG01879/CYP2C19_out /input/HG01879.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01879/CYP2C9_out ]; then
  pypgx run-chip-pipeline CYP2C9 /output/HG01879/CYP2C9_out /input/HG01879.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01879/CYP3A4_out ]; then
  pypgx run-chip-pipeline CYP3A4 /output/HG01879/CYP3A4_out /input/HG01879.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01879/CYP3A5_out ]; then
  pypgx run-chip-pipeline CYP3A5 /output/HG01879/CYP3A5_out /input/HG01879.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01879/CYP2B6_out ]; then
  pypgx run-chip-pipeline CYP2B6 /output/HG01879/CYP2B6_out /input/HG01879.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01879/DPYD_out ]; then
  pypgx run-chip-pipeline DPYD /output/HG01879/DPYD_out /input/HG01879.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01879/TPMT_out ]; then
  pypgx run-chip-pipeline TPMT /output/HG01879/TPMT_out /input/HG01879.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01879/UGT1A1_out ]; then
  pypgx run-chip-pipeline UGT1A1 /output/HG01879/UGT1A1_out /input/HG01879.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01879/NUDT15_out ]; then
  pypgx run-chip-pipeline NUDT15 /output/HG01879/NUDT15_out /input/HG01879.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01879/CYP1A2_out ]; then
  pypgx run-chip-pipeline CYP1A2 /output/HG01879/CYP1A2_out /input/HG01879.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01879/CYP2C8_out ]; then
  pypgx run-chip-pipeline CYP2C8 /output/HG01879/CYP2C8_out /input/HG01879.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01879/NAT2_out ]; then
  pypgx run-chip-pipeline NAT2 /output/HG01879/NAT2_out /input/HG01879.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01879/SLCO1B1_out ]; then
  pypgx run-chip-pipeline SLCO1B1 /output/HG01879/SLCO1B1_out /input/HG01879.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01879/VKORC1_out ]; then
  pypgx run-chip-pipeline VKORC1 /output/HG01879/VKORC1_out /input/HG01879.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01879/IFNL3_out ]; then
  pypgx run-chip-pipeline IFNL3 /output/HG01879/IFNL3_out /input/HG01879.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01879/ABCG2_out ]; then
  pypgx run-chip-pipeline ABCG2 /output/HG01879/ABCG2_out /input/HG01879.vcf --assembly GRCh38 --force
fi
mkdir -p /output/HG01880
if [ ! -d /output/HG01880/CYP2C19_out ]; then
  pypgx run-chip-pipeline CYP2C19 /output/HG01880/CYP2C19_out /input/HG01880.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01880/CYP2C9_out ]; then
  pypgx run-chip-pipeline CYP2C9 /output/HG01880/CYP2C9_out /input/HG01880.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01880/CYP3A4_out ]; then
  pypgx run-chip-pipeline CYP3A4 /output/HG01880/CYP3A4_out /input/HG01880.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01880/CYP3A5_out ]; then
  pypgx run-chip-pipeline CYP3A5 /output/HG01880/CYP3A5_out /input/HG01880.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01880/CYP2B6_out ]; then
  pypgx run-chip-pipeline CYP2B6 /output/HG01880/CYP2B6_out /input/HG01880.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01880/DPYD_out ]; then
  pypgx run-chip-pipeline DPYD /output/HG01880/DPYD_out /input/HG01880.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01880/TPMT_out ]; then
  pypgx run-chip-pipeline TPMT /output/HG01880/TPMT_out /input/HG01880.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01880/UGT1A1_out ]; then
  pypgx run-chip-pipeline UGT1A1 /output/HG01880/UGT1A1_out /input/HG01880.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01880/NUDT15_out ]; then
  pypgx run-chip-pipeline NUDT15 /output/HG01880/NUDT15_out /input/HG01880.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01880/CYP1A2_out ]; then
  pypgx run-chip-pipeline CYP1A2 /output/HG01880/CYP1A2_out /input/HG01880.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01880/CYP2C8_out ]; then
  pypgx run-chip-pipeline CYP2C8 /output/HG01880/CYP2C8_out /input/HG01880.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01880/NAT2_out ]; then
  pypgx run-chip-pipeline NAT2 /output/HG01880/NAT2_out /input/HG01880.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01880/SLCO1B1_out ]; then
  pypgx run-chip-pipeline SLCO1B1 /output/HG01880/SLCO1B1_out /input/HG01880.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01880/VKORC1_out ]; then
  pypgx run-chip-pipeline VKORC1 /output/HG01880/VKORC1_out /input/HG01880.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01880/IFNL3_out ]; then
  pypgx run-chip-pipeline IFNL3 /output/HG01880/IFNL3_out /input/HG01880.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01880/ABCG2_out ]; then
  pypgx run-chip-pipeline ABCG2 /output/HG01880/ABCG2_out /input/HG01880.vcf --assembly GRCh38 --force
fi
mkdir -p /output/HG01881
if [ ! -d /output/HG01881/CYP2C19_out ]; then
  pypgx run-chip-pipeline CYP2C19 /output/HG01881/CYP2C19_out /input/HG01881.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01881/CYP2C9_out ]; then
  pypgx run-chip-pipeline CYP2C9 /output/HG01881/CYP2C9_out /input/HG01881.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01881/CYP3A4_out ]; then
  pypgx run-chip-pipeline CYP3A4 /output/HG01881/CYP3A4_out /input/HG01881.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01881/CYP3A5_out ]; then
  pypgx run-chip-pipeline CYP3A5 /output/HG01881/CYP3A5_out /input/HG01881.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01881/CYP2B6_out ]; then
  pypgx run-chip-pipeline CYP2B6 /output/HG01881/CYP2B6_out /input/HG01881.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01881/DPYD_out ]; then
  pypgx run-chip-pipeline DPYD /output/HG01881/DPYD_out /input/HG01881.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01881/TPMT_out ]; then
  pypgx run-chip-pipeline TPMT /output/HG01881/TPMT_out /input/HG01881.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01881/UGT1A1_out ]; then
  pypgx run-chip-pipeline UGT1A1 /output/HG01881/UGT1A1_out /input/HG01881.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01881/NUDT15_out ]; then
  pypgx run-chip-pipeline NUDT15 /output/HG01881/NUDT15_out /input/HG01881.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01881/CYP1A2_out ]; then
  pypgx run-chip-pipeline CYP1A2 /output/HG01881/CYP1A2_out /input/HG01881.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01881/CYP2C8_out ]; then
  pypgx run-chip-pipeline CYP2C8 /output/HG01881/CYP2C8_out /input/HG01881.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01881/NAT2_out ]; then
  pypgx run-chip-pipeline NAT2 /output/HG01881/NAT2_out /input/HG01881.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01881/SLCO1B1_out ]; then
  pypgx run-chip-pipeline SLCO1B1 /output/HG01881/SLCO1B1_out /input/HG01881.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01881/VKORC1_out ]; then
  pypgx run-chip-pipeline VKORC1 /output/HG01881/VKORC1_out /input/HG01881.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01881/IFNL3_out ]; then
  pypgx run-chip-pipeline IFNL3 /output/HG01881/IFNL3_out /input/HG01881.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01881/ABCG2_out ]; then
  pypgx run-chip-pipeline ABCG2 /output/HG01881/ABCG2_out /input/HG01881.vcf --assembly GRCh38 --force
fi
mkdir -p /output/HG01882
if [ ! -d /output/HG01882/CYP2C19_out ]; then
  pypgx run-chip-pipeline CYP2C19 /output/HG01882/CYP2C19_out /input/HG01882.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01882/CYP2C9_out ]; then
  pypgx run-chip-pipeline CYP2C9 /output/HG01882/CYP2C9_out /input/HG01882.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01882/CYP3A4_out ]; then
  pypgx run-chip-pipeline CYP3A4 /output/HG01882/CYP3A4_out /input/HG01882.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01882/CYP3A5_out ]; then
  pypgx run-chip-pipeline CYP3A5 /output/HG01882/CYP3A5_out /input/HG01882.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01882/CYP2B6_out ]; then
  pypgx run-chip-pipeline CYP2B6 /output/HG01882/CYP2B6_out /input/HG01882.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01882/DPYD_out ]; then
  pypgx run-chip-pipeline DPYD /output/HG01882/DPYD_out /input/HG01882.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01882/TPMT_out ]; then
  pypgx run-chip-pipeline TPMT /output/HG01882/TPMT_out /input/HG01882.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01882/UGT1A1_out ]; then
  pypgx run-chip-pipeline UGT1A1 /output/HG01882/UGT1A1_out /input/HG01882.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01882/NUDT15_out ]; then
  pypgx run-chip-pipeline NUDT15 /output/HG01882/NUDT15_out /input/HG01882.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01882/CYP1A2_out ]; then
  pypgx run-chip-pipeline CYP1A2 /output/HG01882/CYP1A2_out /input/HG01882.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01882/CYP2C8_out ]; then
  pypgx run-chip-pipeline CYP2C8 /output/HG01882/CYP2C8_out /input/HG01882.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01882/NAT2_out ]; then
  pypgx run-chip-pipeline NAT2 /output/HG01882/NAT2_out /input/HG01882.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01882/SLCO1B1_out ]; then
  pypgx run-chip-pipeline SLCO1B1 /output/HG01882/SLCO1B1_out /input/HG01882.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01882/VKORC1_out ]; then
  pypgx run-chip-pipeline VKORC1 /output/HG01882/VKORC1_out /input/HG01882.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01882/IFNL3_out ]; then
  pypgx run-chip-pipeline IFNL3 /output/HG01882/IFNL3_out /input/HG01882.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01882/ABCG2_out ]; then
  pypgx run-chip-pipeline ABCG2 /output/HG01882/ABCG2_out /input/HG01882.vcf --assembly GRCh38 --force
fi
mkdir -p /output/HG01883
if [ ! -d /output/HG01883/CYP2C19_out ]; then
  pypgx run-chip-pipeline CYP2C19 /output/HG01883/CYP2C19_out /input/HG01883.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01883/CYP2C9_out ]; then
  pypgx run-chip-pipeline CYP2C9 /output/HG01883/CYP2C9_out /input/HG01883.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01883/CYP3A4_out ]; then
  pypgx run-chip-pipeline CYP3A4 /output/HG01883/CYP3A4_out /input/HG01883.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01883/CYP3A5_out ]; then
  pypgx run-chip-pipeline CYP3A5 /output/HG01883/CYP3A5_out /input/HG01883.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01883/CYP2B6_out ]; then
  pypgx run-chip-pipeline CYP2B6 /output/HG01883/CYP2B6_out /input/HG01883.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01883/DPYD_out ]; then
  pypgx run-chip-pipeline DPYD /output/HG01883/DPYD_out /input/HG01883.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01883/TPMT_out ]; then
  pypgx run-chip-pipeline TPMT /output/HG01883/TPMT_out /input/HG01883.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01883/UGT1A1_out ]; then
  pypgx run-chip-pipeline UGT1A1 /output/HG01883/UGT1A1_out /input/HG01883.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01883/NUDT15_out ]; then
  pypgx run-chip-pipeline NUDT15 /output/HG01883/NUDT15_out /input/HG01883.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01883/CYP1A2_out ]; then
  pypgx run-chip-pipeline CYP1A2 /output/HG01883/CYP1A2_out /input/HG01883.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01883/CYP2C8_out ]; then
  pypgx run-chip-pipeline CYP2C8 /output/HG01883/CYP2C8_out /input/HG01883.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01883/NAT2_out ]; then
  pypgx run-chip-pipeline NAT2 /output/HG01883/NAT2_out /input/HG01883.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01883/SLCO1B1_out ]; then
  pypgx run-chip-pipeline SLCO1B1 /output/HG01883/SLCO1B1_out /input/HG01883.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01883/VKORC1_out ]; then
  pypgx run-chip-pipeline VKORC1 /output/HG01883/VKORC1_out /input/HG01883.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01883/IFNL3_out ]; then
  pypgx run-chip-pipeline IFNL3 /output/HG01883/IFNL3_out /input/HG01883.vcf --assembly GRCh38 --force
fi
if [ ! -d /output/HG01883/ABCG2_out ]; then
  pypgx run-chip-pipeline ABCG2 /output/HG01883/ABCG2_out /input/HG01883.vcf --assembly GRCh38 --force
fi
