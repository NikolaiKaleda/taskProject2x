var taskProjectApp = angular.module ('taskProjectApp', ['ngCookies', 'angular.filter', 'infinite-scroll']);

taskProjectApp.controller ('TaskProjectCtrl', ['$scope', '$http', '$cookies', '$filter', function ($scope, $http, $cookies, $filter) {
    $scope.taskPageCount=0;
    $scope.page=1;
    $scope.busy=false;
    $scope.showBlockProjects = false;
    $scope.showBlockTask = false;
    $scope.showBlockEditProjects = false;
    $scope.showBlockTask = false;
    $scope.isProjectEdit = false;
    $scope.isTaskEdit = false;
    $scope.currentDate = new Date();
    $scope.currentTimeZone = (new Date).toString().split('(')[1].slice(0, -1);
    var sessionCookies = $cookies.get ('session'),
        activeProjectName;
    
    $scope.activeClass = function (id) {
        return id === $scope.activeProject ? 'active' : '';
    };
    

    getSession  = function () {
        $http ({
            method: 'POST',
            url: 'https://api-test-task.decodeapps.io/signup'
        }).then (function successCallback(response) {
            $cookies.put ('session', response.data.session);
            sessionCookies = response.data.session;
            checkSession();
            return response.data.session;
        }, function errorCallback (response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    };
 
    
    checkSession  = function () {
        $http({
            method: 'GET',
            url: 'https://api-test-task.decodeapps.io/session?session=' + sessionCookies,
        }).then (function successCallback (response) {
            if (response.statusText == "OK"){
                $scope.preloader = {display: 'block'};
                getUser (sessionCookies);
                getProjects (sessionCookies, false);
            }
            else{
                var newSessionCookies = getSession();
                getUser (newSessionCookies);
                getProjects (sessionCookies, false);
            }
        }, function errorCallback (response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    };
    
    
    $scope.init = function () {
        var sessionCookies = $cookies.get ('session');
        if (sessionCookies == undefined) {
            getSession();
        }
        else{
            checkSession();
        }  
    }
    
    
    getUser  = function (sessionCookies) {
        $http({
            method: 'GET',
            url: 'https://api-test-task.decodeapps.io/account?session=' + sessionCookies,
        }).then (function successCallback(response) {
            $scope.userAvatar = response.data.Account.image_url;
            $scope.name = response.data.Account.username;
        }, function errorCallback (response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    };
    
    
    getProjects = function (sessionCookies,activeProjectSelected) {
        $http ({
            method: 'GET',
            url: 'https://api-test-task.decodeapps.io/projects?session=' + sessionCookies,
        }).then (function successCallback (response) {
            $scope.projects = response.data.projects;
            if (!activeProjectSelected) {
                $scope.activeProject = response.data.projects[0].Project.id;
                $scope.projectTitle = response.data.projects[0].Project.title;
            }
            getTasks (sessionCookies, $scope.activeProject, 10, 0, null);
        }, function errorCallback (response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    };
    
    
    createProject = function (sessionCookies, projectTitle) {
        $http ({
            method: 'POST',
            url: 'https://api-test-task.decodeapps.io/projects/project',
            data: {
                "session": sessionCookies,
                "Project": {
                    "title": projectTitle
                }
            }
        }).then (function successCallback(response) {
        if (response.status=200) {
            getProjects (sessionCookies, true);
            $scope.closeProjectPage();
            $scope.activeProject = response.data.Project.id;
            $scope.projectTitle = projectTitle;
            $scope.closeEditProjectPage();
            }
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    }
    
    
    editProject = function (sessionCookies, projectId, projectTitle) {
        $http ({
            method: 'POST',
            url: 'https://api-test-task.decodeapps.io/projects/project',
            data: {
                "session": sessionCookies,
                "Project": {
                    "id": projectId,
                    "title": projectTitle
                }
            }
        }).then (function successCallback(response) {
            if (response.statusText = "OK") {
                getProjects (sessionCookies,true)
                $scope.activeProject = response.data.Project.id;
                activeProjectName = response.data.Project.title;
                $scope.closeEditProjectPage();
                getProjects (sessionCookies,true);
                $scope.closeEditProjectPage();
                $scope.activeProject = response.data.Project.id;
                $scope.activeProjectName = response.data.Project.title;
            }
        }, function errorCallback (response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    };
    
    
    deleteThisProject = function (sessionCookies, projectId) {
        $http ({
            method: 'DELETE',
            url: 'https://api-test-task.decodeapps.io/projects/project?' + 'session=' + sessionCookies + '&project_id=' + projectId,
        })
        .then (function successCallback(response) {
            if (response.status = 200) {
                getProjects (sessionCookies, false)
            }
        }, function errorCallback (response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    }
    
    
    getTasks = function (sessionCookies, projectId, pagingSize, pagingOffset, conditionKeywords) {
        var url = 'https://api-test-task.decodeapps.io/tasks?session=' + sessionCookies + '&project_id=' + projectId + '&paging_size=' + pagingSize + '&paging_offset=' + pagingOffset;
        if (conditionKeywords!=null) {
            url = url + "&condition_keywords=" + conditionKeywords;
        }
        $http ({
            method: 'GET',
            url: url,
        }).then (function successCallback(response) {
            $scope.taskPageCount = Math.ceil(response.data.total_count/10);
            $scope.tasks = [];
            $scope.tasksCount = response.data.tasks.length;
            if ($scope.tasksCount != undefined) {
                angular.forEach (response.data.tasks, function (value, key) {
                    var nowDate = $filter ('date')($scope.currentDate, "EEEE '('MM.dd.yyyy')'", "+0900"),
                        createDate = $filter ('date')(new Date(value.Task.created_at), "EEEE '('MM.dd.yyyy')'", $scope.currentTimeZone),
                        yesterday = new Date ($scope.currentDate.getTime() - (24*60*60*1000)),
                        createdAt,
                        yesterdayDate = $filter ('date')(yesterday, "EEEE '('MM.dd.yyyy')'", "+0900");
                    if (nowDate == createDate) {
                            createdAt = "Today";
                    }
                    else if (yesterdayDate == createDate) {
                        createdAt = "Yesterday";
                    }
                    else {
                        createdAt = createDate;
                    }
                    var task = {
                        "Task": {
                            "id" : value.Task.id,
                            "title" : value.Task.title,
                            "description" : value.Task.description,
                            "created_at" : createdAt
                        }
                    };
                    $scope.tasks.push (task);
                });   
            }
            $scope.preloader = {display : 'none'};
        }, function errorCallback (response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    };
    
    
    compliteTask = function (sessionCookies, taskId) {
        $http ({
            method: 'POST',
            url: 'https://api-test-task.decodeapps.io/tasks/task/complite',
            data: {
                "session" : sessionCookies,
                "Task" : {
                    "id" : taskId,
                }
            }
        }).then (function successCallback (response) {
        if (response.status = 200) {
            getTasks (sessionCookies, $scope.activeProject, 10, 0, null)
            getProjects (sessionCookies, true);
        }
        }, function errorCallback (response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    }
    
    
    createTask = function (sessionCookies, projectId, taskTitle, taskDescription) {
        $http ({
            method: 'POST',
            url: 'https://api-test-task.decodeapps.io/tasks/task',
            data: {
                "session" : sessionCookies,
                "Project" : {
                    "id" : projectId
                },
                "Task" : {
                    "title" : taskTitle,
                    "description" : taskDescription
                }
            }
        }).then (function successCallback (response) {
            if (response.status = 201) {
                var task = {
                    "Task" : {
                        "id" : response.data.Task.id,
                        "title" : taskTitle,
                        "description" : taskDescription,
                        "created_at" : "Today"
                    }
                };
                $scope.tasks.push (task);
                $scope.tasksCount = $scope.tasks.length;
                angular.forEach ($scope.projects, function (value, key) {
                    if (value.Project.id == $scope.activeProject) {
                        value.Project.task_count ++;
                    }
                });               
            }
        }, function errorCallback (response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    }; 
    
    
    editThisTask = function (sessionCookies, taskId, taskTitle, taskDescription) {
        $http ({
            method: 'POST',
            url: 'https://api-test-task.decodeapps.io/tasks/task',
            data: {
                "session" : sessionCookies,
                "Task" : {
                    "id" : taskId,
                    "title" : taskTitle,
                    "description" : taskDescription
                }
            }
        }).then (function successCallbackn (response) {
            if (response.status = 200) {
                $scope.taskId = taskId;
                $scope.taskName = taskTitle;
                $scope.taskDescription = taskDescription;
                $scope.showTaskBlock = true;
                $scope.showBlockTask = false;
                angular.forEach($scope.tasks, function (value, key) {
                    if (value.Task.id == taskId) {
                        value.Task.title = taskTitle;
                    }
                });    
            }
        }, function errorCallback (response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    };
    
    
    deleteThisTask = function (sessionCookies, taskId) {
        $http ({
            method: 'DELETE',
            url: 'https://api-test-task.decodeapps.io/tasks/task?' + 'session=' + sessionCookies + '&task_id=' + taskId,
        })
        .then(function successCallback (response) {
            if (response.status = 200) {
                $scope.closePageTask();
                getProjects (sessionCookies, true);
            }
        }, function errorCallback (response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    }
   
    
    $scope.search = function () {
        if ($scope.searchKeyword != null) {
            getTasks (sessionCookies, $scope.activeProject, 10, 0, $scope.searchKeyword);
        }
    }
    
    
    $scope.addProject = function () {
        createProject (sessionCookies, $scope.projectEdit);
    }

    $scope.updateProject = function () {
        editProject (sessionCookies, $scope.activeProject, $scope.projectEdit);
    }
    
    $scope.deleteProject = function () {
        deleteThisProject (sessionCookies, $scope.activeProject);
    }
    
    $scope.openTask = function (id, title, description) {
        $scope.showTaskBlock = true;
        $scope.bgStyle = {opacity: '0.8'};
        $scope.taskId = id;
        $scope.taskName = title;
        $scope.taskDescription = description;
    }
    
    $scope.editTask = function (id, title, description) {
        $scope.isTaskEdit = true;
        $scope.taskIdEdit = id;
        $scope.taskNameAdd = title;
        $scope.taskDescriptionAdd = description;
        $scope.showTaskBlock = false;
        $scope.showBlockTask = true;
        $scope.bgStyle = {opacity: '0.8'};
    }
    
    $scope.UpdateTask = function () {
        editThisTask (sessionCookies, $scope.taskIdEdit, $scope.taskNameAdd, $scope.taskDescriptionAdd);
    }
    
    $scope.compliteTask = function (taskId) {
        compliteTask (sessionCookies, taskId);
    }
    
    $scope.deleteTask = function (id) {
        deleteThisTask (sessionCookies, id);
    }
    
    $scope.openTasks = function (elemId, elemTitle) {
        var sessionCookies = $cookies.get('session');
        $scope.activeProject = elemId;
        $scope.projectTitle = elemTitle;
        getTasks (sessionCookies, $scope.activeProject, 10, 0, null);
    }
    
    $scope.addTask = function () {
        createTask (sessionCookies, $scope.activeProject, $scope.taskNameAdd, $scope.taskDescriptionAdd);
    }
    
    $scope.openProjectPage = function () {
        $scope.isProjectEdit = false;
        $scope.showBlockEditProjects = true;
        $scope.bgStyle = {opacity: '0.8'};
    }
    $scope.closeProjectPage = function () {
        $scope.showBlockProjects = false;
        $scope.bgStyle = {opacity: '1'};
    }
    $scope.getProjectPageTitle = function () {
        if($scope.isProjectEdit) {
            return 'Edit project';
        } else {
            return 'Create project';
        }
    }
    $scope.openEditProjectPage = function () {
        $scope.isProjectEdit = true;
        $scope.projectEdit = $scope.projectTitle;
        $scope.showBlockEditProjects = true;
        $scope.bgStyle = {opacity: '0.8'};
    }
    $scope.closeEditProjectPage = function () {
        $scope.showBlockEditProjects = false;
        $scope.bgStyle = {opacity: '1'};
    }
    
    $scope.openTaskPage = function () {
        $scope.isTaskEdit = false;
        $scope.showBlockTask = true;
        $scope.bgStyle = {opacity: '0.8'};
    }
    $scope.closeTaskPage = function () {
        $scope.showBlockTask = false;
        $scope.bgStyle = {opacity: '1'};
    }
    $scope.closePageTask = function () {
        $scope.showTaskBlock = false;
        $scope.bgStyle = {opacity: '1'};
    }
    
    
    $scope.nextPage = function() {
        if ($scope.busy) return;
        if($scope.activeProject==undefined) return;
        var page = $scope.page;
        if((page+1)>$scope.taskPageCount) return;
        $scope.busy = true;
        $scope.page ++;    
        var offset=($scope.page-1)*10;       
        var url = 'https://api-test-task.decodeapps.io/tasks?session=' + sessionCookies + '&project_id=' + $scope.activeProject + '&paging_size=' + 10 + '&paging_offset=' + offset;
        $http ({
            method: 'GET',
            url: url,
        }).then (function successCallback(response) {
            if (response.data.tasks.length > 0) {
                angular.forEach (response.data.tasks, function (value, key) {
                    var nowDate = $filter ('date')($scope.currentDate, "EEEE '('MM.dd.yyyy')'", "+0900"),
                        createDate = $filter ('date')(new Date(value.Task.created_at), "EEEE '('MM.dd.yyyy')'", $scope.currentTimeZone),
                        yesterday = new Date ($scope.currentDate.getTime() - (24*60*60*1000)),
                        createdAt,
                        yesterdayDate = $filter ('date')(yesterday, "EEEE '('MM.dd.yyyy')'", "+0900");
                    if (nowDate == createDate) {
                            createdAt = "Today";
                    }
                    else if (yesterdayDate == createDate) {
                        createdAt = "Yesterday";
                    }
                    else {
                        createdAt = createDate;
                    }
                    var task = {
                        "Task": {
                            "id" : value.Task.id,
                            "title" : value.Task.title,
                            "description" : value.Task.description,
                            "created_at" : createdAt
                        }
                    };
                    $scope.tasks.push (task);
                });   
            }
            $scope.busy = false;
           
        }, function errorCallback (response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    }
    
}]);

























