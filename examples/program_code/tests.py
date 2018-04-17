import numpy
from numpy import NaN, nan
import matplotlib.pyplot as plt
import pandas

""" IGNORE THIS. IT IS A TEMPORARY FILE FOR TESTING PURPOSES """


"""
import pandas
df = pandas.read_csv('uk_all_pages_safe.csv', sep='\t')
df = df.astype({'pageid': 'int64'})
print(df.dtypes)
"""


def round_coord(all):
    lat, long = all['lat'], all['long']

    angle = 3
    visible = 145
    long = abs(long) - angle * 18 * (abs(lat) / 90) * (abs(long) / 180)
    long = long * 180 / 140
    long = long if all['long'] > 0 else -long

    all['lat'], all['long'] = lat, long
    return all


df = pandas.read_csv('uk_all_page_coords.csv', sep='\t')
df = pandas.DataFrame().append(df[~df['coordinates'].isnull()],
                               ignore_index=True)

df = df.apply(round_coord, axis=1)
print(df)

plt.clf()
figure = plt.figure()
splt = figure.add_subplot(1, 1, 1)

'''
splt.spines['left'].set_position('center')
splt.spines['bottom'].set_position('center')
splt.spines['right'].set_color('none')
splt.spines['top'].set_color('none')
splt.xaxis.set_ticks_position('bottom')
splt.yaxis.set_ticks_position('left')
'''

plt.rcParams["figure.figsize"] = (20,3)
plt.subplots_adjust(bottom=0, left=0, top=1, right=1)

plt.title('Wikipedia Pages Coordinates')
plt.axis([-180, 180, -90, 90])
plt.plot(df['long'], df['lat'], marker='o', color='#FF000022', markersize=1, linestyle='')
plt.savefig('result.png', dpi=200, transparent=True)



