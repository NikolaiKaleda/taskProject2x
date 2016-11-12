var taskProjectApp = angular.module('taskProjectApp', ['ngCookies']);




taskProjectApp.controller('TaskProjectCtrl', ['$scope', '$http', '$cookies', function ($scope, $http,$cookies) {
    $scope.showBlockProjects = false;
    $scope.showBlockTask = false;
    var sessionCookies = $cookies.get('session');
    //$scope.userAvatar;
    //$scope.userName;
    
      $scope.activeClass = function (id) {
        return id === $scope.activeProject ? 'active' : '';
    };   
    

    
    getSession  = function () {
        var returnCookie;
        $http({
              method: 'POST',
              url: 'https://api-test-task.decodeapps.io/signup'
            }).then(function successCallback(response) {
                $cookies.put('session', response.data.session);
                returnCookie = response.data.session;
              }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
        return returnCookie;
    };
    
    getUser  = function (sessionCookies) {
        $http({
              method: 'GET',
              url: 'https://api-test-task.decodeapps.io/account?session='+sessionCookies,
            }).then(function successCallback(response) {
                console.log(response);
            $scope.userAvatar = response.data.Account.image_url;
             $scope.name = response.data.Account.username;
              }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
    };
    
    getProjects = function (sessionCookies) {
        $http ({
            method: 'GET',
            url: 'https://api-test-task.decodeapps.io/projects?session=' + sessionCookies,
            }).then(function successCallback(response) {
                console.log(response);
                $scope.projects = response.data.projects;
                $scope.activeProject = response.data.projects[0].Project.id;
                getTasks(sessionCookies, $scope.activeProject, 20, 20);                
             }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            });
    };
    
    getTasks = function (sessionCookies, projectId, pagingSize, pagingOffset) {
        $http({
            method: 'GET',
            url: 'https://api-test-task.decodeapps.io/tasks?session='+sessionCookies+'&project_id='+projectId+'&paging_size='+pagingSize+'&paging_offset='+pagingOffset,
            }).then(function successCallback(response) {
             console.log(response);
            $scope.tasksCount = response.data.tasks.length;
             }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            });
    };
    
    createTask = function (sessionCookies, projectId, taskTitle, taskDescription) {
        var returnCookie;
        $http({
              method: 'POST',
              url: 'https://api-test-task.decodeapps.io/tasks/task?'+'session='+sessionCookies+'&Project.id='+projectId+'&Task.title='+taskTitle+'&Task.description='+taskDescription
              /*data: {
                "session": sessionCookies,
                "Project": {
                    "id": projectId
                },
                "Task": {
                    "title": taskTitle,
                    "description": taskDescription
                }
              }*/
            }).then(function successCallback(response) {
                console.log(response);
                //$cookies.put('session', response.data.session);
                //returnCookie = response.data.session;
              }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
        return returnCookie;
    };

    
    
    
    $scope.init = function () {
        var sessionCookies = $cookies.get('session');
        if (sessionCookies == undefined) {
            getSession();
        } 
        //show loader
        $http({
              method: 'GET',
              url: 'https://api-test-task.decodeapps.io/session?session='+sessionCookies,
             // data: { session: sessionCookies }
        }).then(function successCallback(response) {
            //hide loader
            console.log(response);
            if(response.statusText=="OK"){
                getUser(sessionCookies);
                getProjects(sessionCookies);
            }
            else{
                var newSessionCookies = getSession();
                getUser(newSessionCookies);
                getProjects(sessionCookies);
            }
              }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
    }
    
    
    $scope.openTasks = function (elemId) {
        var sessionCookies = $cookies.get('session');
        $scope.activeProject = elemId;
        getTasks(sessionCookies, $scope.activeProject, 20, 20);
    }
    
    $scope.addTask = function () {
        createTask(sessionCookies, $scope.activeProject, $scope.taskNameAdd, $scope.taskDescriptionAdd);
    }
    
    
    
    $scope.openProjectPage = function () {
        $scope.showBlockProjects = true;
        $scope.bgStyle = {opacity: '0.8'};
    }
    $scope.closeProjectPage = function () {
        $scope.showBlockProjects = false;
        $scope.bgStyle = {opacity: '1'};
    }
    
    $scope.openTaskPage = function () {
        $scope.showBlockTask = true;
        $scope.bgStyle = {opacity: '0.8'};
    }
    $scope.closeTaskPage = function () {
        $scope.showBlockTask = false;
        $scope.bgStyle = {opacity: '1'};
    }
}]);

