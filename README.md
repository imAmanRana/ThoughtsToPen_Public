# Thoughts To Pen

**[ThoughtsToPen](https://thoughtstopen.com)** is my personal space on web where i share my knowledge & thoughts.

## Building & Running
* bundle exec jekyll build
* bundle exec jekyll serve


## Config files
* _config.yml --> for production
* _config_dev.yml --> for developement

by default the _config.yml file is used, use the dev yaml file as
bundle exec jekyll [serve|build] --config _config.yml, _config_dev.yml

## Google Analytics
https://github.com/hendrikschneider/jekyll-analytics
Set the environment variable as 
* set JEKYLL_ENV=production
* bundle exec jekyll build

## Theme Credits

[Moon](https://taylantatli.github.io/Moon/moon-theme/).
