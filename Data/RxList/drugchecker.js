var addedDrugs = new Array();
var result = new Array();
var drugCount = 0;

function displayInteractions(obj) {
    var urlList=""; 
    $.each(obj.UrlList, function(i,v){
        urlList+= "<li>" + v + "</li>";
    });

    $("#resultSevUrl").show();
    $("#resultSevUrl").html("<ul>" + urlList + "</ul>");

    var detailList = "";
    var intCount = 0;
    $.each(obj.DetailList, function (i, v) {
        detailList += v;
        intCount++;
    });
    if (intCount > 0) {
        //detailList = "<p>No Interactions Found</p>";
        $("#results").html(detailList);
        $("#resultcontainer").show();
        if (intCount==1)
            $("#foundCount").html(intCount + " Interaction Found");
        else
            $("#foundCount").html(intCount + " Interactions Found");
    }
    else {
        $("#foundCount").html("No Interactions Found");
    }

    $('.tabWrap').each(function () {
        var tab = $(this);
        tab.find('.tabContent').hide();
        tab.find('.tabContent:first').show();
        tab.find('.tabList ul li:first').addClass('active');
        tab.find('.tabList ul li a').bind('click', function () {
            wmdPageLink(($(this).attr('href') == '#tab-1-1') ? 'di-tabcon' : 'di-tabpro');
            $(this).parents('ul').children('li').removeClass('active');
            $(this).parent().addClass('active');
            var currentTab = tab.find($(this).attr('href'));
            tab.find('.tabContent').hide();
            $(currentTab).show();
            return false;
        });
    });

}


function onSearchResults(data) {
    //alert("onSearchResults");
    //console.log(data);
    result = new Array();
    $.each(data, function (i, item) {
        result[i] = {
            label: item.Name, 
            value: item.ID
        }
    });

    $("#txtAutoComplete").autocomplete({
        source: result,
        focus: function (event, ui) {
            $("#txtAutoComplete").val(ui.item.label);
            event.preventDefault();
        },
        select: function (event, ui) {
            var bAdded = false;
            event.preventDefault();
            $("#drugNameOutput ul li").each(function (index) {
                var arTemp = $(this).attr("id").split('_');
                if (ui.item.value == arTemp[1])
                    bAdded = true;
            });

            if (bAdded) {
                alert("Sorry, this drug can't be added because a generic or brand name version is already in your list.");
            } else {

                $("#drugNameOutput").show();
                var sID = 'li_' + ui.item.value;
                var sLI = "<li id='" + sID + "'>" + ui.item.label + "<a class=\"remove\" href=\"javascript:removeDrug('" + ui.item.value + "');\"></a></li>"
                //console.log(sLI);
                $("#drugNameOutput ul").append(sLI);
            }
            $("#txtAutoComplete").val('');
            currentVal = '';
            return false;
        }
    });

}


function removeDrug(id){
    $("#li_" + id).remove();

    var iCount = 0;
    $("#drugNameOutput ul li").each(function (index) {
        iCount++;
    });
    if (iCount == 0) {
        $("#drugNameOutput").hide();
        $("#resultSevUrl").hide();
        $("#resultcontainer").hide();
        $("#foundCount").html("");
    }
    else
        $("#drugNameOutput").show(); 
}


var currentVal = '';
$(document).ready(function () {
    $.support.cors = true;

    $("#resultSevUrl").hide();
    //$("#resultcontainer").hide();

    //temporary for testing
    //$("#drugNameOutput").show();
    $("#drugNameOutput").hide();

    $("#drug_interaction_check").click(function () {
        var drugIds = new Array();
        var sIDList = "";
        $("#drugNameOutput ul li").each(function (index) {
            var arTemp = $(this).attr("id").split('_');
            //0=li, 1=id
            drugIds[index] = parseInt(arTemp[1]);
        });
        if (drugIds.length < 2) {
            alert("At least two drugs are required.");
            return;
        }
        else {
            for (var i = 0; i < drugIds.length; i++) {
                if (i == drugIds.length - 1)
                    sIDList += drugIds[i].toString();
                else
                    sIDList += drugIds[i].toString() + "_";
            }
        }
        //alert(JSON.stringify(req));
        $.support.cors = true;
        $.ajax({
            type: "GET",
            url: "https://www.rxlist.com/api/drugchecker/drugchecker.svc/interactionlist/" + sIDList,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                //alert('Drug Interaction called successfully using JSON');
                displayInteractions(response);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert(XMLHttpRequest.response);
                alert(textStatus);
                var error = eval('(' + XMLHttpRequest.response + ')');
                //alert(error.data);
                //alert(error.Badwords);
                alert("Error occured while calling Drug Interaction Checker!");
            }
        });
    });



    $("#txtAutoComplete").val("");
    $("#txtAutoComplete").keyup(function () {
        if (($("#txtAutoComplete").val() != currentVal) || currentVal == '') {
            if ($("#txtAutoComplete").val() != '') {
                currentVal = $("#txtAutoComplete").val();

                $.ajax({
                    url: "https://www.rxlist.com/api/drugchecker/drugchecker.svc/druglist/" + currentVal,
                    dataType: "json",
                    success: function (data) {
                        onSearchResults(data);
                    }
                });
            }
        }
    });


    $("#start_over_check").click(function () {
        $("#drugNameOutput ul li").each(function (index) {
            $(this).remove();
        });
        $("#drugNameOutput").hide();
        $("#resultSevUrl").hide();
        $("#resultcontainer").hide();
        $("#foundCount").html("");
    });

});

