#Dropbox Analytics

##Background
Take advantage of Dropbox API to perform basic analytics. This project was deployed in "development" mode and tested. 

##Output
This project lists files are listed by size and type. Folders and hidden files are ignored.

##Next Steps
This project is a proof of concept (POC) that validates integration with ```dropbox``` API and identifies areas for improvement

##Get Started

###Signup as Dropbox Developer
Visit https://www.dropbox.com/developers/apps 

###Update configuration
Copy ```config/dboxconfig-copy.js``` as ```config/dboxconfig.js``` with necessary information. You can turn on the ```debug``` flag here and the default ```port```


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
