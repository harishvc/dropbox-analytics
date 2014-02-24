#Dropbox Analytics
Integrate with Dropbox API using ```node.js``` & perform basic analytics. Currently this project lists top 5 files (customizable) by size and mime-type. This project ignores directories and hidden files while processing.

##Get Started

###Register your dropbox app
Visit https://www.dropbox.com/developers/apps 

###Configuration
* Copy ```config/dboxconfig-copy.js``` as ```config/dboxconfig.js```
* Add ```AppKey``` & ```AppSecret``` values
* You can also turn on the ```debug``` flag & change the default ```port```
```
 port: 3000,
 environment: "development",
 logstatus: "false",
 loglevel: 1,
 Appkey: "APP-KEY",
 Appsecret: "APP-KEY",
 timezone: "UTC",
 debug: false
```

###Start Express
```$>node server.js```

###Driven by
```node.js```, ```ejs``` & ```express```

### Screen Shots
* Getting started

  http://harishvc.github.io/pics/dropbox-start.png

* Terminal output (when debug is enabled)

  http://harishvc.github.io/pics/dropbox-console.png

* Results

  http://harishvc.github.io/pics/dropbox-output.png

* Metadata

  http://harishvc.github.io/pics/dropbox-metadata.png
