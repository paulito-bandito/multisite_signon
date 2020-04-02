/* esversion: 5.1 */
/*  
    AUTHOR: Paul Walter
    DATE:   Feb 21st 2020
    
    ASSUMPTIONS:

    0) ES 5.1 only: no classes, const, lets, arrow functions, typescript, and no 3rd party components allowed.
    1) This app/widget may exist on a page with other app or widgets and needs to have it's own namespace.
    2) Documentation is required (choosing JSDoc format) .
    3) Eventually this will communicate via async calls: I'll need to devide the app into areas of responsibility (Service, Controller, Models, UI). 
    4) Sites objects will be eventually sent by the Server (unless serverside rendering) and have a unique ID.
*/

var 
    /**
     * The namespace for the app that will add New Households (hence "multisite").
     * @module multisite
     */
    multisite = multisite || {},
    /**
    * The HTML Id of the Element we are going to print out serialized objects to.  
    */
    DEBUG_ID = "debug";

/**
 * Data model namespace for adding a new Household. 
 * @module multisite.controller
*/
multisite.model = function Model() {
    var
        /**
         * Represents a member of the sites
         * 
         * @class Site
         * @constructor
         *   
         * @param {Integer} data.age        How old the Site is (Must be older than Site.AGE_MIN)
         * @param {boolean} data.isSmoker   If the site is a smoker
         * 
         * @throws {Error}  Will throw an error if the arguments aren't correct
         */
        Site = function (data) {
            var            
                _site = {
                    url: data.url,
                    tags: data.tags
                };

            return Object.assign(Object.create(Site.prototype), _site);
        };

    return {Site: Site };
}();

/**
* Controller namespace for the New Household app. 
* @module multisite.controller
*/
multisite.service = function () { /**
     * Fake data arriving from a fake server: we are wrapping it in a Decorator object so we can add validation in an object oriented
     * @type 
     */
   

    var LOGIN_APPEND = "/login/index.php",
        Site = multisite.model.Site,
        getSites = function () {
            return new Promise(function (resolve, reject) {
                resolve(sites);
            });
        },
        /**
         * Populate sites with fake data (assuming no server-side pre-render and that this data will arrive via http)
         */
        sites = [
            Site({ url: "that.com", tags: "exputo" }),
            Site({ url: "anotherSite.com", tags: "" }),
            Site({ url: "yetAnotherSite.com", tags: "" })
        ],
        /**
         * Occurs when the user clicks the "submit" button. It's displaying the serialized data to the screen. 
         */
        loginToMoodleSite = function (sites) {
            try {
                debugger;
                const   WEBSERVICE_URL = "http://lms37.exputo.com/login/token.php",
                        data = {
                            username: "paulywaltero@gmail.com",
                            password: "catInHat1!" 
                        };
                        
                        var _url = WEBSERVICE_URL;

                        $.ajax({
                            type: "POST", 
                            data:{username:data.username,password:data.password},
                            contentType: "application/x-www-form-urlencoded",
                            url: WEBSERVICE_URL,
                            dataType: "json",
                            success: function(data){debugger;
                                var win = window.open();
                                win.document.write(data);
                            }
                        })  

                        /*$.ajax({
                            type: "POST",
                            username: data.username,
                            password: data.password,
                            data:{username:data.username,password:data.password},
                            dataType: "xml",
                            contentType: "application/x-www-form-urlencoded",
                            url: WEBSERVICE_URL,
                            success:function(response){
                                var msg = ""; debugger;
                                if(response == 1){
                                    msg = "I'm in!";
                                }else{
                                    msg = "Invalid username and password!";
                                }
                                console.log(msg);
                            },
                            error: function( response ){
                                console.log(response);
                            }
                       });*/

                        /*$.ajax({
                            url: WEBSERVICE_URL,
                            type:'post',
                            username: data.username,
                            password: data.password,
                            data:{username:data.username,password:data.password},
                            success:function(response){
                                var msg = ""; debugger;
                                if(response == 1){
                                    window.location = "home.php";
                                }else{
                                    msg = "Invalid username and password!";
                                }
                                $("#message").html(msg);
                            }
                        });*/
                                
            } catch (exp) {
                reportError("error", exp);
            }
        },
        /**
         * Method for reporting errors in the "wild" back to the server
         */
        reportError = function (exp, exp2) {
            // Make a fake server call
            // TODO: hook this up to a server
            console.warn("Error reporter not implemented yet, writing object serialization to the HTML page.");
            console.error(exp, exp2);
        };

    return {
        getSites: getSites,
        loginToMoodleSite: loginToMoodleSite,
        reportError: reportError
    };
}();


/**
* Controller namespace for the New Household app.
*
* Acts like an observable subect: when the internal state changes, it notifies it's listeners. 
*  
* @module multisite.controller
*/
multisite.controller = function () {

    var Site = multisite.model.Site,
        service = multisite.service,
        filterStr = "",
        sites = [],
        /**
         * A list of UIs that we need to update.
         */
        observers = [],
        updateObservers = function () {
            for (var i = 0; i < observers.length; i++) {
                try {
                    observers[i]();
                } catch (exp) {
                    service.reportError(exp);
                }
            }
        },
        /**
         * The controller is the subject being observed, decouple 
         * the mechanism that will notify any registered views to 
         * update
         */
        addObserver = function (observer) {
            if (observer && observer.call) {
                observers.push(observer);

                // update the new view with the latest data
                updateObservers();
            }
        },
        /*
        * Serialize and send the models to the server
        */
        loginToMoodleSite = function () {
            try {
                service.loginToMoodleSite();
            } catch (exp) {
                service.reportError(exp);
            }

        },
        /**
         * Call for the site objects wtih a Promise
         */
        init = function () {
            try {
                service.getSites().then(function (sites) {
                    multisite.controller.sites = sites; 
                    updateObservers();
                });
            } catch (exp) {
                service.reportError(exp);
            }
        },
        filterSites = function( filterString ){
            filterStr = filterString;
            updateObservers();
        },
        /**
         * @return {Array<Sites>}
         */
        getSites = function () { 
             var sitesFiltered = [],
                 unfiltered = multisite.controller.sites;


             // See if there are any tag filters
                 
            if( filterStr && filterStr.length ){
                sitesFiltered = unfiltered.filter(function (el) {
                    return el.tags.indexOf( filterStr ) > -1;
                    });
            } else{
                sitesFiltered = unfiltered;
            }
            
            return sitesFiltered ;
        },
        /**
         * "Revealing Module" pattern from Crockford. 
         */
        returnData = {
            sites: sites,
            addObserver: addObserver,
            loginToMoodleSite: loginToMoodleSite,
            reportError: service.reportError,
            getSites: getSites,
            filterSites: filterSites
        };

    init();

    return returnData;
}();

/**
* View namespace for the New Household app. 
* @module multisite.controller
*/
multisite.view = function () {
   
    var
        /**
         * Apologies for the gross stringified stylesheet. Wanted to keep this all in one file. 
         */
        
        QS_SITES = '#sites',
        QS_SEARCH_BTN = "#searchBtn",
        QS_FILTER_INPUT = "#filterInput",
        QS_OPEN_MOODLE_SITE_BTN = '#openSite',
        /** 
         * Indicates if the select box was initalized with it's (fake) data 
         */
        sitesInited = false,
        controller = multisite.controller,
        /**
         * Just an internal namespace to group methods that handle actions
         */
        actions = {
            /**
             * Gets called when the controller's data changes.
             */
            update: function () {
                var
                    /**
                     * Render the Selectbox of Sitess
                     */
                    renderSites = function () {
                     
                        try {
                            var selectBox = document.querySelector(QS_SITES),
                                sites = controller.getSites(),
                                option;

                            // only update the select box if it hasn't been yet.
                            if ( sites && sites.length) {
                      

                                // clear previous options
                                selectBox.options.length = 0;

                                for (var i = 0; i < sites.length; i++) {
                                    option = document.createElement('option');

                                    // NOTE:    Embed the ID and if it is valid in the value so when 
                                    //          it is selected we can just parse the string and find 
                                    //          both pieces of info. 
                                    option.value = sites[i].url;
                                    option.textContent = sites[i].url;
                                    selectBox.appendChild(option);
                                }
                            }else{
                                selectBox.options.length = 0;
                            }

                        } catch (exp) {
                            controller.reportError(exp);
                        }
                    };

                    
                renderSites();
            },
            filterOnClick: function () {
                debugger;
                const filters = document.querySelector(QS_FILTER_INPUT).value;
                controller.filterSites( filters );
            },
            /**
             * Occurs when the user submit button
             */
            loginToMoodleSite: function () {
                try {
                    controller.loginToMoodleSite();
                } catch (exp) {
                    controller.reportError(exp);
                }
                return false;
            }
        },
        init = function () { 
            try { // subscribe to changes
                controller.addObserver(actions.update);

                // attach event listeners
                document.querySelector(QS_SEARCH_BTN).addEventListener('click', actions.filterOnClick);
                document.querySelector(QS_OPEN_MOODLE_SITE_BTN).addEventListener('click', actions.loginToMoodleSite);

            } catch (exp) {
                controller.reportError(exp);
            }
        };

    init();

    // Crockford's "Reveling Module Pattern"
    return { update: actions.update };
}();