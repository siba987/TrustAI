import json

with open('__log file name__') as json_file:  
    data = json.load(json_file)

for k in data['study'].keys():
    print('\n', k)
    print(data['study'][k])
