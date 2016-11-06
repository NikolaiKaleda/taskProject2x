$(function() {
	// Dropdown toggle
	$('.dropdown-toggle').click(function(){
		$(this).next('.dropdown').toggle();
	});

	$(document).click(function(e) {
		var target = e.target;
		if (!$(target).is('.dropdown-toggle') && !$(target).parents().is('.dropdown-toggle')) {
			$('.dropdown').hide();
		}
	});
});

$(document).ready(function () {
	var bodyHeight = $('body').outerHeight();
	$('.sidebar').height(bodyHeight);
});