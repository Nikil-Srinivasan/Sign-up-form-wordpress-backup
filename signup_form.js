// var growSurfId = (window.location.hostname.indexOf("document360.com") > -1) ? 'jo8oql' : 'a8uih6';
// (function(g, r, s, f) {
//     g.growsurf = {};
//     g.grsfSettings = { campaignId: growSurfId, version: "2.0.0" };
//     s = r.getElementsByTagName("head")[0];
//     f = r.createElement("script");
//     f.async = 1;
//     f.src = "https://growsurf.com/growsurf.js" + "?v=" + g.grsfSettings.version;
//     f.setAttribute("grsf-campaign", g.grsfSettings.campaignId);
//     !g.grsfInit ? s.appendChild(f) : "";
// })(window, document);
$('#success-form-submit').hide();
var windowWidth = $(window).width();
var knowledgeBaseType = null;
var firstName = "";
var lastName = "";
var email = "";
var telephone = "";
/*var password = $("input[name=Password]").val();*/
var jobtitle = "";
var timeline = "";
var projectName = "";
var knowledgeBaseTypeCondition = false;
var otherInputCondition = false;
var condition = false

window.addEventListener('resize', function(event) {
    windowWidth = $(window).width();
    //$('#signupform').valid()? $('#btn-signup').removeAttr('disabled'):$('#btn-signup').attr('disabled', 'disabled');
    validateFormField();
}, true);

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.search);
    if (results == null) {
        return "";
    } else {
        return results.input;
    }
}

var token;

function onTokenReceived(tokenValue) {
    token = tokenValue;
    validateFields();
}

var submitForms = "#signupform";

$(submitForms).submit(function (event) {
    event.preventDefault();
    var formId = event.target.id;
    $(":submit").prop("disabled", true);    
    onSubmit.call(this, token);
});

// Function to get the language code from the URL path
function getLanguageFromPath() {
    var path = window.location.pathname;
    var pathSegments = path.split('/');
    return pathSegments[1]; // Assuming the language code is always the first segment
}

// Get the language code from the URL path
var languageCode = getLanguageFromPath();

// Set the SignupMetaDataValue based on the language code
var SignupMetaDataValue;
if (languageCode === "sv") {
    SignupMetaDataValue = "FREE-TRIAL-SWEDEN"; 
} else if (languageCode === "es") {
    SignupMetaDataValue = "FREE-TRIAL-SPAIN"; 
} else if (languageCode === "pt-br") {
    SignupMetaDataValue = "FREE-TRIAL-PT-BR"; 
} else {
    SignupMetaDataValue = "SAAS_FREE_TRIAL_COMPLETE"; // Default value if no language code is found
}

function onSubmit() {
    var firstName = $("input[name=FirstName]").val();
    var lastName = $("input[name=LastName]").val();
    var email = $("input[name=Email]").val();
    var telephone = $("input[name=Telephone]").val();
    /*var password = $("input[name=Password]").val();*/
    var jobtitle = $("input[name=JobTitle]").val();
    var timeline = $("select[name=Timeline]").val();
    var sessionId = AutopilotAnywhere.sessionId;
    var gtmLeadSource = referrerDomain;
    var _this = this;

    var marketingPayload = {
        "FirstName": firstName,
        "LastName": lastName,
        "Email": email,
        "ClientIP": kovaiClientIP || ' ', // Getting client IP from window object
        "Jobtitle": jobtitle,
        "SignupMetaData": SignupMetaDataValue,
        "Telephone": telephone,
        "SystemEnvironment": 0,
        "SignupStage": 6,
        "QueryString": "https://document360.com/signup/",
        "GtmLeadSource": gtmLeadSource,
        "AutoPilotSessionId": sessionId,
        // "GAConnectorData": doc360GetGAConnectorData(),
        "ReferrerHistory": Object.values(doc360ref.getJsonHistory()),
        "Comment": "Timeline:" + timeline,
    };
    if (windowWidth > 760) {
        var registerPayload = {
            "FirstName": firstName,
            "LastName": lastName,
            "Email": email,
            /*"Password": password,
            "ConfirmPassword": password,*/
            "PhoneNumber": telephone,
            "RecaptchToken": token,
            "MarketingPayload": JSON.stringify(marketingPayload),
			"DisableRecaptcha": true,
        };
    } else if (windowWidth <= 760) {
        var registerPayload = {
            "FirstName": firstName,
            "LastName": lastName,
            "Email": email,
            /*"Password": password,
            "ConfirmPassword": password,*/
            "PhoneNumber": telephone,
            "RecaptchToken": token,
            // "SubdomainName": projectName,
            // "ProjectProtection": parseInt(knowledgeBaseType),
            "MarketingPayload": JSON.stringify(marketingPayload),
			"DisableRecaptcha": true,
        };
    }

    $.ajax({
        type: "POST",
//         url: "https://identity.document360.info/api/RegisterNewUser",
        url: "https://identity.document360.net/api/RegisterNewUser",
// 		url: "https://identity.berlin.document360.net/api/RegisterNewUser",
// 		url: "https://identity.delhi.document360.net/api/RegisterNewUser",
// 	    url: "https://identity.dev.document360.net/api/RegisterNewUser",
        data: JSON.stringify(registerPayload),
        contentType: 'application/json',
        crossDomain: true,
        xhrFields: {
            withCredentials: true
        },
        success: function(result) {
            // addParticipantRefferal(email);
            // if (windowWidth <= 760) {
            //     ($('#signupform').hide(), ($('#success-form-submit').show(), $('#createdProjectName').text(projectName)));
            // }
            // redirectToIdentity();
            redirectToIdentity(result.activateAccountUrl);
        },
        error: function(result) {
            $("#exception_message_content").html("");
            var json = JSON.parse(result.responseText);
            if (json.errors) {
                var sub_ul = $('<ul/>');
				if (typeof json.errors === 'string') {
					if (json.errors =='Sequence contains more than one element.'){
						json.errors = ["Looks like you already have an account with this mail ID. Please proceed for <a href='https://identity.document360.info/Account/Login'>Login</a>"];
					}
					else {
						json.errors = ["Something went wrong. Please try again later."];
					}
				}
                if (Array.isArray(json.errors))
                    ExceptionEl(json.errors, sub_ul);
                else
                    $.each(json.errors, function(elkey) {
                        if (Array.isArray(json.errors[elkey]))
                            ExceptionEl(json.errors[elkey], sub_ul);
                    });
                $(".exception_message").show().animate({
                    right: "-100%"
                }, 100, function() {
                    $(this).css("right", "20px");
                });
                $("#exception_message_content").append(sub_ul);
                $("#btn-signup").show();
                $(".loading_form").hide();
            }
        }
    });

    $("#btn-signup").hide();
    $(".loading_form").show();
    return false;
}

$(function() {
    validateFormField();
});

function validateFormField() {
    // if (windowWidth <= 760) {
    //     $('#KnowledgeBaseType').on('change', function() {
    //         $(".exception_message").hide();
    //         knowledgeBaseType = $("select[name=KnowledgeBaseType]").val();
    //         if (knowledgeBaseType != "") {
    //             knowledgeBaseTypeCondition = true;
    //             if (otherInputCondition && $('#signupform').valid()) {
    //                 $('#btn-signup').removeAttr('disabled');
    //             } else {
    //                 $('#btn-signup').attr('disabled', 'disabled');
    //             }
    //         } else {
    //             $('#btn-signup').attr('disabled', 'disabled');
    //         }
    //     });
    // }
    $('form input, form select').on('keyup change', function() {

        validateFields();
    });
    
}

function validateFields()
{
    if (windowWidth <= 760) {
        condition = firstName != "" && lastName != "" && email != "" && jobtitle != "" && telephone != "" && timeline != "";
    } else if (windowWidth > 760) {
        condition = firstName != "" && lastName != "" && email != "" && jobtitle != "" && telephone != "" && timeline != "";
    }
    $(".exception_message").hide();
    firstName = $("input[name=FirstName]").val();
    lastName = $("input[name=LastName]").val();
    email = $("input[name=Email]").val();
    /* var password = $("input[name=Password]").val(); */
    jobtitle = $("input[name=JobTitle]").val();
    telephone = $("input[name=Telephone]").val();
    timeline = $("select[name=Timeline]").val();
    
    if (condition && token) {
        otherInputCondition = true;
        if ($('#signupform').valid()) {
            $('#btn-signup').removeAttr('disabled');
        } else {
            $('#btn-signup').attr('disabled', 'disabled');
        }
    } else {
        $('#btn-signup').attr('disabled', 'disabled');
    }
}

$(function() {

    if (getCookie("firstName") != "") {
        $("input[name=FirstName]").parent().addClass("is-completed");
    }
    if (getCookie("lastName") != "") {
        $("input[name=LastName]").parent().addClass("is-completed");
    }
    if (getCookie("email") != "") {
        $("input[name=Email]").parent().addClass("is-completed");
    }
    if (getCookie("jobtitle") != "") {
        $("input[name=JobTitle]").parent().addClass("is-completed");
    }
    if (windowWidth <= 760) {
        if (getCookie("projectName") != "") {
            $("input[name=ProjectName]").parent().addClass("is-completed");
        }
        if (getCookie("knowledgeBaseType") != "") {
            $("select[name=KnowledgeBaseType]").parent().addClass("is-completed");
        }
    }
    /*    if (getCookie("organisation") != "") {
            $("input[name=Organisation]").parent().addClass("is-completed");
        }*/
    if (getCookie("telephone") != "") {
        $("input[name=Telephone]").parent().addClass("is-completed");
    }
    if (getCookie("timeline") != "") {
        $("select[name=Timeline]").parent().addClass("is-completed");
    }
    /*    if (getCookie("country") != "") {
            $("input[name=Country]").parent().addClass("is-completed");
        }*/
    $(".focus-input").focus(function() {
        $(this).parent().addClass("is-active is-completed");
    });
    $(".focus-input").focusout(function() {
        if ($(this).val() === "")
            $(this).parent().removeClass("is-completed");
        $(this).parent().removeClass("is-active");
    })

    $("#phone").keypress(function(e) {
        if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
            return false;
        }
    });

    var email = localStorage.getItem("Email");

    $("input[name=Email]").val(email);
    var utmValue = undefined;

    function addFormElem(paramName) {
        var paramValue = getParameterByName(paramName);
        if (paramValue != "") {
            utmValue = paramValue;
        }
    }

    var utmParams = {
        "Source": "utm_src",
        "Medium": "utm_mdm",
        "Campaign": "utm_camp",
        "kwd": "utm_kwd"
    };
    addFormElem(utmParams['Source']);

    $(".exception_message").hide();
    $(".outcome_message").hide();
    $(".loading_form").hide();

    if (windowWidth > 760) {
        $("#signupform").validate({
            rules: {
                FirstName: {
                    required: true,
                    accept: /^[^~`!@#$%^&*)(+=|\]\[\-\\\x22{};:?\/>/<_'.,0-9]{2,}$/,
                },
                LastName: {
                    required: true,
                    accept: /^[^~`!@#$%^&*)(+=|\]\[\-\\\x22{};:?\/>/<_'.,0-9]{1,}$/,
                },
                Email: {
                    required: true,
                    email: true,
                    remote: "https://contact.kovai.co/api/document360/is-allowed-email?signupStage=6"
                },
                /*Password: {
                    required: true,
                    accept: /^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,}).{8,}$/
                },*/
                JobTitle: {
                    required: true,
                },
                Telephone: {
                    required: true,
                    minlength: 10,
                    maxlength: 15
                },
                Timeline: {
                    required: true,
                },
            },
            messages: {
                FirstName: {
                    required: "Required",
                    accept: "First name must have atleast 2 characters. Numbers and special characters are not allowed",
                },
                LastName: {
                    required: "Required",
                    accept: "Last name must have atleast 1 characters. Numbers and special characters are not allowed",
                },
                Email: {
                    required: "Required",
                },
                /*Password: {
                    required: "Required",
                    accept: "" /!*The password must contain 8 characters. It should have a number, an upper and a lower case letter, and a symbol.*!/
                },*/
                JobTitle: {
                    required: "Required",
                },
                Timeline: {
                    required: "Required",
                }
            },
            submitHandler: function(form, event) {
                event.preventDefault(); //prevent form submit before captcha is completed
            }
        });
    } else if (windowWidth <= 760) {
        $("#signupform").validate({
            rules: {
                FirstName: {
                    required: true,
                    accept: /^[^~`!@#$%^&*)(+=|\]\[\-\\\x22{};:?\/>/<_'.,0-9]{2,}$/,
                },
                LastName: {
                    required: true,
                    accept: /^[^~`!@#$%^&*)(+=|\]\[\-\\\x22{};:?\/>/<_'.,0-9]{1,}$/,
                },
                Email: {
                    required: true,
                    email: true,
                    remote: "https://contact.kovai.co/api/document360/is-allowed-email?signupStage=6"
                },
                JobTitle: {
                    required: true,
                },
                // KnowledgeBaseType: {
                //     required: true,
                // },
                // ProjectName: {
                //     required: true,
                //     accept : /^[^~`!@#$%^&*)(+=|\]\[{};:?\\/<>'".,]*$/,
                // },
                Telephone: {
                    required: true,
                    minlength: 10,
                    maxlength: 15
                },
                Timeline: {
                    required: true,
                },
            },
            messages: {
                FirstName: {
                    required: "Required",
                    accept: "First name must have atleast 2 characters. Numbers and special characters are not allowed",
                },
                LastName: {
                    required: "Required",
                    accept: "Last name must have atleast 1 characters. Numbers and special characters are not allowed",
                },
                Email: {
                    required: "Required",
                },
                /*Password: {
                    required: "Required",
                    accept: "" /!*The password must contain 8 characters. It should have a number, an upper and a lower case letter, and a symbol.*!/
                },*/
                JobTitle: {
                    required: "Required",
                },
                KnowledgeBaseType: {
                    required: "Required",
                },
                ProjectName: {
                    required: "Required",
                    accept : "Special characters except hyphen and underscore are not allowed"
                },
                Timeline: {
                    required: "Required",
                }
            },
            submitHandler: function(form, event) {
                event.preventDefault(); //prevent form submit before captcha is completed
            }
        });
    }

    $(".alert_close").click(function() {
        $(this).parent('div').hide();
    });
});

function ExceptionEl(errors, sub_ul) {
    errors.forEach(error => {
        if (Array.isArray(error)) {
            error.forEach(suberror => {
                var sub_li = $('<li/>');
                sub_li.html(suberror);
                sub_ul.append(sub_li);
            });
        } else {
            var sub_li = $('<li/>');
            sub_li.html(error);
            sub_ul.append(sub_li);
        }
    });
    return sub_ul;
}

function postSignupFormData(marketingPayload) {
    $.ajax({
        url: "https://secure.biztalk360.com/api/document360/create-update-user",
        type: "POST",
        dataType: "json",
        data: marketingPayload,
        cache: false,
        success: function(response) {
            console.log(response);
        }
    }).always(function() {
        window.location.href = "https://identity.document360.io";
    });
}

// function redirectToIdentity() {
//     window.location.href = "https://identity.document360.io";
// }
function redirectToIdentity(activateAccountUrl) {
    window.location.href = activateAccountUrl;
  }
function postSignupFormDataMobile(marketingPayload) {
    $.ajax({
        url: "https://secure.biztalk360.com/api/document360/create-update-user",
        type: "POST",
        dataType: "json",
        data: marketingPayload,
        cache: false,
        success: function(response) {
            console.log(response);
        }
    })
}

// function addParticipantRefferal(userEmail) {
//     try {
//         if (growsurf) {
//             growsurf.addParticipant(userEmail);
//         }
//     } catch (err) {
//         console.log(err);
//     }

// }

$(document).ready(function() {
    jQuery.validator.addMethod("accept", function(value, element, param) {
        return value.match(new RegExp(param));
    });

    var emailId = decodeURI(GetURLParameter("emailId"));
    if (emailId) {
        $("input[name=Email]").val(emailId);
        $("input[name=Email]").addClass('not-empty');
        $("#signupform").validate();
    } else {
        $("input[name=Email]").removeClass('not-empty');
    }
});

function GetURLParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
    return "";
}

$(document).ready(function() {
    $("#signupform").validate();
    /*$(".pr-password").passwordRequirements({});*/
});

/*
$(document).on('click', '.pass_show', function () {
    $(this).text($(this).text() == "Show" ? "Hide" : "Show");
    $(this).toggleClass('showIcon');

    $('#Password').attr('type', function (index, attr) {
        return attr == 'password' ? 'text' : 'password';
    });
});*/
