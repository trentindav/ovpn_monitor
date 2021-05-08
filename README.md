## OpenVPN Monitor for InfluxDB

Simple process to monitor the content of OpenVPN status file.
It periodically read the content of the file, extract information about
Rx and Tx Bytes for each user and their IPs and save them into InfluxDB.

This is just an excuse to learn Javascript and should not be taken for anything
more than that.

### TODO

- Save users IPs in DB
- Configurable period for monitoring
