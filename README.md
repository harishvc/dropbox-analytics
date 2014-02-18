#Dropbox Analytics
Learn Dropbox API & perform basic analytics. Currently this project lists top 5 files by size and mime-type. This project ignores directories and hidden files while processing.

##What to expect?
When the project is deployed you 
This project lists files are listed by size and type. Folders and hidden files are ignored.

##Get Started

###Register your dropbox app
Visit https://www.dropbox.com/developers/apps 

###Configuration
* Copy ```config/dboxconfig-copy.js``` as ```config/dboxconfig.js```
* And add ```AppKey``` & ```AppSecret```
* You can turn on the ```debug``` flag here & default ```port``` here
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
