/**
 * Prepros
 * (c) Subash Pathak
 * sbshpthk@gmail.com
 * License: MIT
 */

/*jshint browser: true, node: true*/
/*global prepros, angular, _, $*/

prepros.factory('config', function ($http) {

    'use strict';

    var fs = require('fs-extra'),
        path = require('path'),
        os = require('os');

    //Base path
    var basePath = path.join(path.dirname(process.execPath), 'app');

    //Package.json file url
    var packageFileUrl = path.join(basePath, '../package.json');

    //Read package.json file and get data of app in prepros object
    var packageData = angular.fromJson(fs.readFileSync(packageFileUrl).toString());

    //We need package path because everything is relative to this file
    var packagePath = path.join(basePath, '..');

    //CachePath
    var cachePath = path.join(os.tmpdir(), 'PreprosCache');

    //Node modules required by the app
    var node_modules = packageData.dependencies;

    //App version
    var version = packageData.version;

    //App urls
    var online = {
        url: 'http://alphapixels.com/prepros',
        helpUrl: 'http://alphapixels.com/prepros/docs/',
        loveUrl: 'http://alphapixels.com/prepros#love',
        updateFileUrl: 'http://alphapixels.com/prepros/update.json',
        githubUrl: 'http://github.com/sbspk/prepros',
        authorTwitter: 'http://twitter.com/sbspk',
        authorUrl: 'http://alphapixels.com'
    };

    //Ruby Executable
    var ruby = {
        path: path.join(packagePath, packageData.ruby.path),
        version: packageData.ruby.version
    };

    //Gems
    ruby.gems = {};
    for ( var gemKey in packageData.ruby.gems ) {

        if(packageData.ruby.gems.hasOwnProperty(gemKey)) {
            ruby.gems[gemKey] = {

                path: path.join(packagePath, packageData.ruby.gems[gemKey].path),
                version: packageData.ruby.gems[gemKey].version
            };
        }
    }

    //Read user config
    var userConfig = {};
    try {

        $.parseJSON(localStorage.PreprosConfig);

    } catch (e) {

        window.alert('Error Reading Configurations ! Reverting to defaults.');

        saveUserOptions(userConfig);
    }

    var defaultConfig = {
        cssPath: 'css',
        jsPath: 'js',
        htmlPath: 'html',
        htmlExtension: '.html',
        enableSuccessNotifications: true,
        enableErrorNotifications: true,
        filterPatterns: '',
        useCustomRuby: false,
        customRubyPath: '',


        //Default Less Options
        less : {
            autoCompile: true,
            compress : false,
            lineNumbers: false,
            strictMath: true,
            strictUnits: true
        },

        //Default Sass options
        sass : {
            autoCompile : true,
            lineNumbers : false,
            unixNewlines: false,
            debug: false,
            compass : false,
            fullCompass: false,
            outputStyle : 'expanded' //compressed, nested, expanded, compact
        },


        //Default Stylus Options
        stylus : {
            autoCompile: true,
            lineNumbers : false,
            nib : false,
            compress : false
        },

        //Default Markdown Options
        markdown : {
            autoCompile: true,
            sanitize: false,
            gfm: true
        },

        //Default Coffeescript Options
        coffee: {
            autoCompile: true,
            bare: false,
            uglify: false
        },

        //Default javascript options
        javascript: {
            autoCompile: true,
            uglify: true
        },

        //Default Jade  Options
        jade: {
            autoCompile: true,
            pretty: true
        },

        //Default Haml Options
        haml: {
            autoCompile: true,
            format: 'html5', //xhtml, html5
            outputStyle: 'indented', //indented, ugly
            doubleQuotes: false
        },

        //Default Slim  Options
        slim: {
            autoCompile: true,
            pretty: true,
            indent: 'default', //default, four, tab
            fourSpaceIndent: true,
            format: ':html5' //:xhtml, :html4, :html5, :html
        }
    };

    //Fill in the undefined values from default configurations
    userConfig = _.defaults(userConfig, defaultConfig);

    for ( var configKey in userConfig ) {

        if(userConfig.hasOwnProperty(configKey) && typeof userConfig[configKey] === 'object') {

            userConfig[configKey] = _.defaults(userConfig[configKey], defaultConfig[configKey]);
        }
    }

    //Wrap user options in a function to prevent angular data sharing between services
    //If user config data is shared between files changing configuration of one file will affect another file
    function getUserOptions() {

        return $.parseJSON(angular.toJson(userConfig, false));

    }

    function saveUserOptions(options) {

        localStorage.setItem('PreprosConfig', angular.toJson(options));

        userConfig = $.parseJSON(angular.toJson(options));
    }

    function checkUpdate(success, fail){

        var opt = {method: 'get', url: online.updateFileUrl, cache: false};

        var checker = $http(opt);

        checker.success(function(data){

            data = data[0];

            if(config.version !== data.version) {

                success({
                    available: true,
                    version: data.version,
                    date: data.date
                });
            } else {
                success({
                    available: false,
                    version: version,
                    date: data.date
                });
            }
        });

        checker.error(function(data){

            if(fail){
                fail();
            }
        });
    }


    var config =  {
        cachePath: cachePath,
        basePath: basePath,
        ruby: ruby,
        node_modules: node_modules,
        online: online,
        version: version,
        getUserOptions: getUserOptions,
        saveUserOptions: saveUserOptions,
        checkUpdate: checkUpdate
    };

    //Push to global so other windows can also read configurations
    global.preprosConfig = config;

    return config;

});