import pandas
from numpy import NaN, nan, NAN

df = pandas.read_csv('ru_all_page_coords.csv', sep='\t')
df1 = df[~df['coordinates'].isnull()]
df2 = df[~df['long'].isnull()]
print(len(df1), len(df2))
print(df1, df2)
