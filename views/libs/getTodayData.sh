#!/bin/bash

yesterdayDate=$(date -d "yesterday" '+%Y-%m-%d')
date=$(date '+%Y%m%d')

IFS='-' read -ra my_array <<< "$yesterdayDate"

year=${my_array[0]};
month=${my_array[1]};
day=${my_array[2]};
echo $year;
echo $month;
echo $day;

echo $date

declare -a level

level=([0]=lev_10_m_above_ground=on [1]=lev_950_mb=on [2]=lev_850_mb=on [3]=lev_700_mb=on [4]=lev_500_mb=on [5]=lev_250_mb=on [6]=lev_70_mb=on [7]=lev_10_mb=on)

declare -i index=0
for i in "${level[@]}"
do
	curl "https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_1p00.pl?file=gfs.t00z.pgrb2.1p00.f000&$i&var_UGRD=on&var_VGRD=on&dir=%2Fgfs.$date%2F00" -o gfs.t00z.pgrb2.1p00.$i
	
#	echo "https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_1p00.pl?file=gfs.t00z.pgrb2.1p00.f000&$i&all_var=on&dir=%2Fgfs.$date%2F00"
	
	if [ $index == 0 ]
	then
		/home/ec2-user/CloudComputingAssign2/grib2json/target/grib2json-0.8.0-SNAPSHOT/bin/grib2json -d -n -o current-wind-surface-level-gfs-1.0.json gfs.t00z.pgrb2.1p00.$i
		mv current-wind-surface-level-gfs-1.0.json /home/ec2-user/Cloud/data/weather/current/
		
	elif [ $index == 1 ]
	then
		/home/ec2-user/CloudComputingAssign2/grib2json/target/grib2json-0.8.0-SNAPSHOT/bin/grib2json -d -n -o current-wind-isobaric-1000hPa-gfs-1.0.json gfs.t00z.pgrb2.1p00.$i
		mv current-wind-isobaric-1000hPa-gfs-1.0.json /home/ec2-user/Cloud/data/weather/current/
		
	elif [ $index == 2 ]
	then
		/home/ec2-user/CloudComputingAssign2/grib2json/target/grib2json-0.8.0-SNAPSHOT/bin/grib2json -d -n -o current-wind-isobaric-850hPa-gfs-1.0.json gfs.t00z.pgrb2.1p00.$i
		mv current-wind-isobaric-850hPa-gfs-1.0.json /home/ec2-user/Cloud/data/weather/current/
		
	elif [ $index == 3 ]
	then
		/home/ec2-user/CloudComputingAssign2/grib2json/target/grib2json-0.8.0-SNAPSHOT/bin/grib2json -d -n -o current-wind-isobaric-700hPa-gfs-1.0.json gfs.t00z.pgrb2.1p00.$i
		mv current-wind-isobaric-700hPa-gfs-1.0.json /home/ec2-user/Cloud/data/weather/current/
		
	elif [ $index == 4 ]
	then
		/home/ec2-user/CloudComputingAssign2/grib2json/target/grib2json-0.8.0-SNAPSHOT/bin/grib2json -d -n -o current-wind-isobaric-500hPa-gfs-1.0.json gfs.t00z.pgrb2.1p00.$i
		mv current-wind-isobaric-500hPa-gfs-1.0.json /home/ec2-user/Cloud/data/weather/current/
		
	elif [ $index == 5 ]
	then
		/home/ec2-user/CloudComputingAssign2/grib2json/target/grib2json-0.8.0-SNAPSHOT/bin/grib2json -d -n -o current-wind-isobaric-250hPa-gfs-1.0.json gfs.t00z.pgrb2.1p00.$i
		mv current-wind-isobaric-250hPa-gfs-1.0.json /home/ec2-user/Cloud/data/weather/current/
		
	elif [ $index == 6 ]
	then
		/home/ec2-user/CloudComputingAssign2/grib2json/target/grib2json-0.8.0-SNAPSHOT/bin/grib2json -d -n -o current-wind-isobaric-70hPa-gfs-1.0.json gfs.t00z.pgrb2.1p00.$i
		mv current-wind-isobaric-70hPa-gfs-1.0.json /home/ec2-user/Cloud/data/weather/current/
		
	elif [ $index == 7 ]
	then
		/home/ec2-user/CloudComputingAssign2/grib2json/target/grib2json-0.8.0-SNAPSHOT/bin/grib2json -d -n -o current-wind-isobaric-10hPa-gfs-1.0.json gfs.t00z.pgrb2.1p00.$i
		mv current-wind-isobaric-10hPa-gfs-1.0.json /home/ec2-user/Cloud/data/weather/current/
		
	else
		echo "none"
	fi
	rm gfs.t00z.pgrb2.1p00.$i
	index=$index+1
done
./getSpecificDayData.sh $year $month $day



