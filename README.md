## OpenVPN Monitor for InfluxDB

Simple process to monitor the content of OpenVPN status file.
It periodically read the content of the file, extract information about
Rx and Tx Bytes for each user and their IPs and save them into InfluxDB.

This is just an excuse to learn Javascript and should not be taken for anything
more than that.

## InfluxDB

To quickly test this plugin for InfluxDB, run Influx as a Docker container

```
docker network create influx
docker run -d --name=influxdb  -p 8086:8086  -v  /tmp/testdata/influx:/root/.influxdbv2 --net=influx quay.io/influxdb/influxdb:v2.0.3
```

Then go to the Web interface to complete the setup: `http://localhost:8086`

### TODO

- Save users IPs in DB
- Configurable period for monitoring
