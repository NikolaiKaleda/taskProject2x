taskProjectApp.controller('TaskProjectCtrl', ['$scope', function ($scope) {
    $scope.showBlockProjects = false;
    $scope.openProjectPage = function () {
        $scope.showBlockProjects = true;
        $scope.bgStyle = {opacity: '0.8'};
    }
    $scope.closeProjectPage = function () {
        $scope.showBlockProjects = false;
        $scope.bgStyle = {opacity: '1'};
    }
    $scope.addProject = function () {
        console.log($scope.project);
    }
}]);

