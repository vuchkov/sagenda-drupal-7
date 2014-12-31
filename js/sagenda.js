/**
 * @file
 * JavaScript for Sagenda.
 */
(function ($) {
  Drupal.behaviors.sagenda = {
  attach: function(context) {
      $.ajax({
        type: 'GET',
	    crossDomain : true,
	    dataType: 'html',
	    url: Drupal.settings.sagenda.apiURL+'Events/GetBookableItemList/'+Drupal.settings.sagenda.authToken,
	    success: function(data) {
	    data1 = $.parseJSON(data);
	    $.each(data1, function(idx, obj) {
		$('#edit-bookable-items').append(new Option(obj.Name, obj.Id));
	      });
	  }
	}); 

      $(".bookable_dates").after('<a href="http://www.sagenda.net" target="_blank" class="sagenda-ref-link">Create a free Booking Account on Sagenda!</a>');      
      $('#edit-start-date, #edit-end-date').bind('change', function(){
	  $('#edit-bookable-items').val(0);
	  $('#edit-bookable-dates').hide();
	  return check_dates();
	});
      
      function check_dates(){
	$('.sagenda_reservation_form .confirm-messages').hide();
	$('.sagenda_reservation_form .error-messages').hide();
	var startDate=$('#edit-start-date').val();
	var endDate=$('#edit-end-date').val();
	startDate=startDate.split("-");
	endDate=endDate.split("-");
	var stDate=startDate[0]+"/"+startDate[1]+"/"+startDate[2];
	stDate=new Date(stDate).getTime();
	var etDate=endDate[0]+"/"+endDate[1]+"/"+endDate[2];
	etDate=new Date(etDate).getTime();
	if (etDate > 0 && etDate < stDate) {
	  $('.sagenda_reservation_form .error-messages').show().text('The start date can not be greater than the End Date');
	  return false;
	}
	return true;
      }
      
      $('#edit-bookable-items').change(function(){
	  $('.sagenda_reservation_form .confirm-messages').hide();
	  $('.sagenda_reservation_form .error-messages').hide();
	  
	  auth_token = Drupal.settings.sagenda.authToken;
	  bookable_item_name = $('#edit-bookable-items option:selected').text();
	  bookable_item_id = $('#edit-bookable-items option:selected').val();
	  start_date = $('#edit-start-date').val();
	  end_date = $('#edit-end-date').val();
	  if($('#edit-start-date').val().length == 0  || $('#edit-end-date').val().length == 0) {
	    $(".sagenda_reservation_form .error-messages").show().text("Please Select the Start and End date.");
	    return false;
	  }
	  else if(this.value == 0) {
	    $(".sagenda_reservation_form .error-messages").show().text("Please Select a Bookable Item to see the Events");
	    return false;
	  }
	  if (check_dates()){
	    url = Drupal.settings.sagenda.apiURL+'Events/GetAvailability/'+auth_token+'/'+start_date+'/'+end_date;
	    $.ajax({
	      type: 'GET',
		  url: url,
		  crossDomain : true,
		  dataType: 'html',
		  data: {
		'bookableItemId': bookable_item_id,
		    },
		  success: function(data) {
		  data1 = $.parseJSON(data);
		  if(data1.length == 0) {
		      $("#edit-bookable-dates").show().text("No events found for the bookable item within the selected date range.");
		      $(".bookable_dates").css("display", "block"); 
		  } else {
		      $("#edit-bookable-dates").text('');
		      $('#edit-bookable-dates').show();
		      $.each(data1, function(idx, obj) {
			  $("#event_schedule_id").val(obj.EventScheduleId);
			  $("#edit-bookable-dates").append('<div class="add-border"><input type="radio" value='+obj.BookableItems[0].Id+' id='+obj.EventIdentifier+' name="book_room"/><label for="radio1">'+obj.DateDisplay+" : "+obj.BookableItems[0].Name+'</label></div>');
		      });
		  }
		  
		  $(".bookable_dates").css("display", "block"); 
		  $("input:radio[name=book_room]").click(display_booking_form);
		},
		  error: function(XMLHttpRequest, textStatus, errorThrown) {
		  console.log(errorThrown);
		}
	      });
	  }
	});
      
      $("#sagenda-reservation").submit(function(e) {
	  var filter = /^[\w\-\.\+]+\@[a-zA-Z0-9\.\-]+\.[a-zA-z0-9]{2,4}$/;
	  var numericReg = /^\d*[0-9](|.\d*[0-9]|,\d*[0-9])?$/;
	  is_error = true;
	  if($('#edit-first-name').val().trim().length==0) {
	    $("#edit-first-name").css("background" , "#FFAAAA");
	    is_error = false;
	  } else if ($('#edit-first-name').val().match(/\d+/g)) {
	      alert("First name should use letters only");
	      $("#edit-first-name").css("background" , "#FFAAAA");
	      $("#edit-first-name").focus();
	      is_error = false;
	  }
	  else {
	    $("#edit-first-name").css("background" , "#FFFFFF");
	  }
	  
	  if($('#edit-last-name').val().trim().length==0) {
	    $("#edit-last-name").css("background" , "#FFAAAA");
	    is_error = false;
	  } else if ($('#edit-last-name').val().match(/\d+/g)) {
	      alert("Last name should use letters only");
	      $("#edit-last-name").css("background" , "#FFAAAA");
	      $("#edit-last-name").focus();
	      is_error = false;
	  }
	  else {
	    $("#edit-last-name").css("background" , "#FFFFFF");
	  }
	  
	  if($('#edit-phone-no').val().trim().length==0) {
	    $("#edit-phone-no").css("background" , "#FFAAAA");
	    is_error = false;
	  } else if (!numericReg.test($('#edit-phone-no').val())) {
	      alert("Phone should use numerics only");
	      $("#edit-phone-no").css("background" , "#FFAAAA");
	      $("#edit-phone-no").focus();
	      is_error = false;
	  }
	  else {
	    $("#edit-phone-no").css("background" , "#FFFFFF");
	  }
	  
	  if($('#edit-email').val().trim().length==0) {
	    $("#edit-email").css("background" , "#FFAAAA");
	    is_error = false;
	  }
	  else if (filter.test($("#edit-email").val())==false){
	    $("#edit-email").css("background" , "#FFAAAA");
	    $("#edit-email").focus();
	    is_error = false;
	  } else {
	    $("#edit-email").css("background" , "#FFFFFF");
	  }
	  return is_error;
	});
      
      $('#back_cal').click(function(){
	  $('.booking_form').css("display", "none");
	  $('.sagenda_reservation_form').css("display", "block");
	  return false;
	});
      
      function display_booking_form(){
	$('.sagenda_reservation_form').css("display", "none");
	$('.booking_form').css("display", "block");
	$("#event_identifier").val(this.id);
      }
    }
  }
})(jQuery);

