function closeModel(modelId){
	$("#"+modelId).modal('hide');
}

function openModel(modelId){
	$("#"+modelId).modal('show');
}

function openTabModel(){
	readyColorPickar();
	$('#tab_isInsert').val('');
	$('#tab_Modal_headder').html('Add Tab');
	$('#tab_Modal_button').html('Add');
	openModel('tab_Modal');
}

function saveTab(){
	var tabLabel = $('#tab_Label_popup').val();
	var bgColor = $('#tab_BG_color_popup').val();
	var congaAPI = $('#tab_congaAPI_popup').val();
	var status = $('#tab_status_popup').val();
	var tabNumber = $('#tab_isInsert').val();
	if(tabLabel != '' && bgColor != ''){
		addTab(tabLabel, bgColor, congaAPI, status, tabNumber);
	}else{
		if(bgColor==''){
			$('#tab_BG_color_popup').css({"border": "1px solid #DC1616"});
		}                
		if(tabLabel==''){
			$('#tab_Label_popup').css({"border": "1px solid #DC1616"});
		}
	}
}

function closeTabModel(){
	closeModel("tab_Modal");
	//1px solid #ccc;
	$('#tab_Label_popup').css({"border": "1px solid #ccc"});
	$('#tab_BG_color_popup').css({"border": "1px solid #ccc"});
	$('#tab_BG_color_popup').val('');            
	$('#tab_Label_popup').val('');
	$('#tab_congaAPI_popup').val('');
	$('#tab_status_popup').val('');
	$('#tab_isInsert').val('');
}

function openSecModel(tabSeq){
	$('#sec_tab_seq_popup').val('');
	$('#sec_sec_seq_popup').val('');
	$('#section_Modal_headder').html('Add Section');
	$('#section_Modal_button').html('Add');
	if(tabSeq!=''){
		$('#sec_tab_seq_popup').val(tabSeq);
		openModel('section_Modal');
	}
}

function saveSection(){
	var secLabel = $('#sec_Label_popup').val();
	var tabSeq = $('#sec_tab_seq_popup').val();
	var secorder = $('#sec_sec_seq_popup').val();
	if(secLabel != '' && tabSeq != ''){
		addSection(secLabel, tabSeq, secorder);
	}else{
		if(secLabel == ''){
			$('#sec_Label_popup').css({"border": "1px solid #DC1616"});
		}
		
		if(tabSeq == ''){
			alert('Something went wrong please refresh and try again.');
		}
	}
}

function closeSecModel(){
	closeModel('section_Modal');
	$('#sec_Label_popup').css({"border": "1px solid #ccc"});
	$('#sec_Label_popup').val('');
	$('#sec_tab_seq_popup').val('');
	$('#sec_sec_seq_popup').val('');
}

function openVfpModel(tabSeq){
	$('#vfp_tab_seq_popup').val('');
	$('#vfp_sec_seq_popup').val('');
	$('#vfp_Modal_headder').html('Add VF Page');
	$('#vfp_Modal_button').html('Add');
	if(tabSeq!=''){
		$('#vfp_tab_seq_popup').val(tabSeq);
		openModel('vf_page_Modal');
	}
}

function savevfp(){
	var pgLabel = $('#vfp_Label_popup').val();
	var pgPage = $('#vfp_InlineApiName').val();
	var pgWidth = $('#vfp_width').val();
	var pgHeight = $('#vfp_height').val();
	var pgTabSeq = $('#vfp_tab_seq_popup').val();
	var pgorder = $('#vfp_sec_seq_popup').val();
	if(pgLabel != '' && pgTabSeq != ''){
		addVfp(pgLabel, pgPage, pgWidth, pgHeight, pgTabSeq, pgorder);
	}else{
		if(pgLabel == ''){
			$('#vfp_Label_popup').css({"border": "1px solid #DC1616"});
		}
		if(pgPage == ''){
			$('#vfp_InlineApiName').css({"border": "1px solid #DC1616"});
		}
		if(pgWidth == ''){
			$('#vfp_width').css({"border": "1px solid #DC1616"});
		}
		if(pgHeight == ''){
			$('#vfp_height').css({"border": "1px solid #DC1616"});
		}
		
		if(pgTabSeq == ''){
			alert('Something went wrong please refresh and try again.');
		}
	}
}

function closevfpModel(){
	closeModel('vf_page_Modal');
	$('#vfp_Label_popup').css({"border": "1px solid #ccc"});
	$('#vfp_InlineApiName').css({"border": "1px solid #ccc"});
	$('#vfp_width').css({"border": "1px solid #ccc"});
	$('#vfp_height').css({"border": "1px solid #ccc"});
	$('#vfp_Label_popup').val('');
	$('#vfp_InlineApiName').val('');
	$('#vfp_width').val('');
	$('#vfp_height').val('');
	$('#vfp_tab_seq_popup').val('');
	$('#vfp_sec_seq_popup').val('');
}

function openFieldModel(tabSeq, secSeq){
	$('#field_Modal_headder').html('Add Field');
	$('#field_Modal_button').html('Add');
	
	if(tabSeq != '' && secSeq != ''){
		$('#field_tab_seq_popup').val(tabSeq);
		$('#field_sec_seq_popup').val(secSeq);
		openModel('field_Modal');
	}
}

function saveField(){
	var fieldLabel = $('#field_Label_popup').val();
	var apiName = $('#field_apiName_popup').val();
	var helpText = $('#field_helpText_popup').val();
	var isRequired = $('#field_checkbox_popup').prop("checked");
	var tabSeq = $('#field_tab_seq_popup').val();
	var secSeq = $('#field_sec_seq_popup').val();
	var fieldSeq = $('#field_field_seq_popup').val();
				
	if(fieldLabel != '' && apiName != '' && tabSeq !='' && secSeq != ''){
		addField(apiName, fieldLabel, helpText, isRequired, tabSeq, secSeq, fieldSeq);
	}else{
		if(fieldLabel == ''){
			$('#field_Label_popup').css({"border": "1px solid #DC1616"});
		}
		if(apiName == ''){
			$('#field_apiName_popup').css({"border": "1px solid #DC1616"});
		}
		if(tabSeq == '' || secSeq ==''){
			alert('Something went wrong please refresh and try again.');
		}
	}
}

function closeFieldModel(){
	closeModel('field_Modal');
	$('#field_Label_popup').css({"border": "1px solid #ccc"});
	$('#field_apiName_popup').css({"border": "1px solid #ccc"});
	$('#field_Label_popup').val('');
	$('#field_apiName_popup').val('');
	$('#field_helpText_popup').val('');
	$('#field_checkbox_popup').prop("checked",false);
	$('#field_tab_seq_popup').val('');
	$('#field_sec_seq_popup').val('');
	$('#field_field_seq_popup').val('');
}


function openGlanceModel(){
	$('#glance_field_seq_popup').val('');
	$('#glance_field_Modal_headder').html('Add Field');
	$('#glance_field_Modal_button').html('Add');
	openModel('glance_field_Modal');
}

function saveGlance(){
	var fieldLabel = $('#glance_Label_popup').val();
	var apiName = $('#glance_apiName_popup').val();
	var fieldSeq = $('#glance_field_seq_popup').val();
	
	if(fieldLabel != '' && apiName != ''){
		addGlance(apiName, fieldLabel, fieldSeq);
	}else{
		if(fieldLabel == ''){
			$('#glance_Label_popup').css({"border": "1px solid #DC1616"});
		}
		if(apiName == ''){
			$('#glance_apiName_popup').css({"border": "1px solid #DC1616"});
		}                
	}
}

function closeGlanceModel(){
	closeModel('glance_field_Modal');
	$('#glance_Label_popup').val('');
	$('#glance_apiName_popup').val('');
	$('#glance_field_seq_popup').val('');            
}

function openButtonModel(){
	$('#button_field_seq_popup').val('');
	$('#custom_Buttom_Modal_headder').html('Add Button');
	$('#custom_Buttom_Modal_button').html('Add');
	openModel('custom_Buttom_Modal');
}
	
/* function saveButton(){
	var buttonLabel = $('#button_Label_popup').val();
	var apiName = $('#button_apiName_popup').val();
	var action = $('#button_action_popup').val();
	var jsaction = $('#button_jsaction_popup').val();
	var buttonSeq = $('#button_field_seq_popup').val();
	
	if(buttonLabel != '' && apiName != '' && action != ''){
		addCustomButton(buttonLabel, apiName, action,jsaction,buttonSeq);
	}else{
		if(buttonLabel == ''){
			$('#button_Label_popup').css({"border": "1px solid #DC1616"});
		}
		if(apiName == ''){
			$('#button_apiName_popup').css({"border": "1px solid #DC1616"});
		}
		if(action == ''){
			$('#button_action_popup').css({"border": "1px solid #DC1616"});
		}                
	}
} */

function saveButton(){
	var buttonLabel = $('#button_Label_popup').val();
	var apiName = $('#button_apiName_popup').val();
	var action = $('#button_action_popup').val();
	var jsaction = $('#button_jsaction_popup').val();
	var buttonSeq = $('#button_field_seq_popup').val();
	
	if(buttonLabel != ''){
		var erromsg = '';
		$('#button_Label_popup').css({"border": "1px solid #ccc"});
		if((apiName != '' && action != '') || jsaction != ''){
			$('#returnfalseId').html('');
			if(apiName == '' && action == ''){
				if(jsaction.includes('return false')){
					addCustomButton(buttonLabel, apiName, action,jsaction,buttonSeq);
					$('#button_jsaction_popup').css({"border": "1px solid #ccc"});
					$('#returnfalseId').html('');
				}else{
					$('#returnfalseId').html('Javascript buttons without a URL action must end with a \'return false\' statement.');
					$('#button_apiName_popup').css({"border": "1px solid #ccc"});
					$('#button_action_popup').css({"border": "1px solid #ccc"});
					$('#button_jsaction_popup').css({"border": "1px solid #DC1616"});
				}
				
			}else if(apiName != '' && action != ''){
				addCustomButton(buttonLabel, apiName, action,jsaction,buttonSeq);
				$('#button_apiName_popup').css({"border": "1px solid #ccc"});
			    $('#button_action_popup').css({"border": "1px solid #ccc"});
			}else{
				if(apiName == '' && action != ''){
					$('#button_apiName_popup').css({"border": "1px solid #DC1616"});
					erromsg = '\'Button Api Name\' is mandatory.';
					$('#button_action_popup').css({"border": "1px solid #ccc"});
					$('#button_jsaction_popup').css({"border": "1px solid #ccc"});
					
				}else if(apiName != '' && action == ''){
					$('#button_action_popup').css({"border": "1px solid #DC1616"});
					erromsg = '\'Action\' is mandatory.';
					$('#button_apiName_popup').css({"border": "1px solid #ccc"});
					$('#button_jsaction_popup').css({"border": "1px solid #ccc"});
				}
				
				if(erromsg != ''){
					$('#returnfalseId').html(erromsg);
				}
			}
					
		}else{
			//var erromsg = '';
			if(apiName == '' && action == '' && jsaction == ''){
				$('#button_apiName_popup').css({"border": "1px solid #DC1616"});
				$('#button_action_popup').css({"border": "1px solid #DC1616"});
				$('#button_jsaction_popup').css({"border": "1px solid #DC1616"});			
				$('#returnfalseId').html('Add either \'Button Api Name and Action or JavaScript Action\' ');
				
			}
			else if(apiName == '' && action != ''){
				$('#returnfalseId').html('\'Button Api Name\' is mandatory.');
				//erromsg = '\'Button Api Name\' is mandatory.';
				$('#button_apiName_popup').css({"border": "1px solid #DC1616"});
				$('#button_jsaction_popup').css({"border": "1px solid #ccc"});
				
			}else if(apiName != '' && action == ''){
				$('#returnfalseId').html('\'Action\' is mandatory.');
				//erromsg = '\'Action\' is mandatory.';
				$('#button_jsaction_popup').css({"border": "1px solid #ccc"});
				$('#button_action_popup').css({"border": "1px solid #DC1616"});
			}
			
		}
	}else{
		$('#button_Label_popup').css({"border": "1px solid #DC1616"});
	}
	
	
}
	
function closeButtonModel(){
	closeModel('custom_Buttom_Modal');
	$('#button_Label_popup').val('');
	$('#button_apiName_popup').val('');
	$('#button_action_popup').val('');
	$('#button_jsaction_popup').val('');
	$('#button_field_seq_popup').val('');
	
	$('#button_Label_popup').css({"border": "1px solid #ccc"});
	$('#button_apiName_popup').css({"border": "1px solid #ccc"});
	$('#button_action_popup').css({"border": "1px solid #ccc"});
	$('#button_jsaction_popup').css({"border": "1px solid #ccc"});
	
	$('#returnfalseId').text('');
}
	
function openRelatedLtsModel(){
	$('#relatedLst_modal_header').html('Add Releted List');
	$('#relatedLst_pop_button').html('Add');
	$('#relatedLst_seq_popup').val('');
	openModel('relatedLst_Modal');
}

function saveRelatedLst(){
	var relatedLstLabel = $('#relatedLst_Label_popup').val();
	var relatedLstName = $('#relatedLst_apiName_popup').val();
	var relatedLstObjApi = $('#relatedLst_obgapi_popup').val();
	var relatedLstAppSubmit = $('#relatedLst_checkbox_popup').prop("checked");
	var relatedLstSeq = $('#relatedLst_seq_popup').val();
	
	if(relatedLstLabel!='' && relatedLstName!='' && relatedLstObjApi!=''){
		addRelatedLst(relatedLstLabel,relatedLstName,relatedLstObjApi,relatedLstAppSubmit,relatedLstSeq);
	}else{
		if(relatedLstLabel==''){
			$('#relatedLst_Label_popup').css({"border": "1px solid #DC1616"});
		}
		if(relatedLstName==''){
			$('#relatedLst_apiName_popup').css({"border": "1px solid #DC1616"});
		}
		if(relatedLstObjApi==''){
			$('#relatedLst_obgapi_popup').css({"border": "1px solid #DC1616"});
		}
	}
}
	
function closeRelatedLstModel(){
	closeModel('relatedLst_Modal');
	$('#relatedLst_Label_popup').val('');
	$('#relatedLst_apiName_popup').val('');
	$('#relatedLst_obgapi_popup').val('');
	$('#relatedLst_checkbox_popup').prop("checked",false);
	$('#relatedLst_seq_popup').val('');
	$('#relatedLst_Label_popup').css({"border": "1px solid #ccc"});
	$('#relatedLst_apiName_popup').css({"border": "1px solid #ccc"});
	$('#relatedLst_obgapi_popup').css({"border": "1px solid #ccc"});
}
	
function isDeleteTab(tabNumber){
	/*if(confirm('Do you want to delete tab')){
		deleteTab(tabNumber);
	}*/
	swal({
		title: "Are you sure?",
		text: "Do you want to delete Tab!",
		type: "warning",
		showCancelButton: true,
		confirmButtonColor: '#DD6B55',
		confirmButtonText: 'Yes, delete it!',
		closeOnConfirm: false,
		showLoaderOnConfirm: true,
	},
	function(){
		deleteTab(tabNumber);
	});
}

 function swalClose(type){
	swal("Deleted!", type+" is Deleted", "success");
 }
	
function isDeleteSec(tabNumber,secNumber){
	/*if(confirm('Do you want to delete Section')){
		deleteSection(tabNumber,secNumber);
	}*/
	swal({
		title: "Are you sure?",
		text: "Do you want to delete Section!",
		type: "warning",
		showCancelButton: true,
		confirmButtonColor: '#DD6B55',
		confirmButtonText: 'Yes, delete it!',
		closeOnConfirm: false,
		showLoaderOnConfirm: true,
	},
	function(){
		deleteSection(tabNumber,secNumber);
	});
}
	
function isDeleteVfp(tabNumber,vfpNumber){
	/*if(confirm('Do you want to delete Visual force page')){
		deleteVFPPage(tabNumber,vfpNumber);
	}*/
	
	swal({
		title: "Are you sure?",
		text: "Do you want to delete Inline visualforce page!",
		type: "warning",
		showCancelButton: true,
		confirmButtonColor: '#DD6B55',
		confirmButtonText: 'Yes, delete it!',
		closeOnConfirm: false,
		showLoaderOnConfirm: true,
	},
	function(){
		deleteVFPPage(tabNumber,vfpNumber);
	});
}

function isFieldDelete(tabNumber,secNumber,fieldNumber){
	/*if(confirm('Do you want to delete Field')){
		deleteField(tabNumber,secNumber,fieldNumber);
	}*/
	
	swal({
		title: "Are you sure?",
		text: "Do you want to delete Field!",
		type: "warning",
		showCancelButton: true,
		confirmButtonColor: '#DD6B55',
		confirmButtonText: 'Yes, delete it!',
		closeOnConfirm: false,
		showLoaderOnConfirm: true,
	},
	function(){
		deleteField(tabNumber,secNumber,fieldNumber);
	});
}

function isGlanceDelete(glanceSeq){
	/*if(confirm('Do you want to delete Field')){
		deleteGlance(glanceSeq);
	}*/
	
	swal({
		title: "Are you sure?",
		text: "Do you want to delete Field!",
		type: "warning",
		showCancelButton: true,
		confirmButtonColor: '#DD6B55',
		confirmButtonText: 'Yes, delete it!',
		closeOnConfirm: false,
		showLoaderOnConfirm: true,
	},
	function(){
		deleteGlance(glanceSeq);
	});
}
	
function isButtonDelete(buttonSeq){
	/*if(confirm('Do you want to delete Button')){
		deleteCustButton(buttonSeq);
	}*/
	
	swal({
		title: "Are you sure?",
		text: "Do you want to delete Button!",
		type: "warning",
		showCancelButton: true,
		confirmButtonColor: '#DD6B55',
		confirmButtonText: 'Yes, delete it!',
		closeOnConfirm: false,
		showLoaderOnConfirm: true,
	},
	function(){
		deleteCustButton(buttonSeq);
	});
}
	
 function isRelatedLstDelete(reletedLstSeq){
	 /*if(confirm('Do you want to delete Button')){
		deleteRelatedLst(reletedLstSeq);
	}*/
	 
	swal({
		title: "Are you sure?",
		text: "Do you want to delete Related List!",
		type: "warning",
		showCancelButton: true,
		confirmButtonColor: '#DD6B55',
		confirmButtonText: 'Yes, delete it!',
		closeOnConfirm: false,
		showLoaderOnConfirm: true,
	},
	function(){
		deleteRelatedLst(reletedLstSeq);
	});
}

function isTabUpdate(tabId){
	var tabName = $('#'+tabId).data('tabname');
	var bgColor = $('#'+tabId).data('bgcolor');
	var congaApiName = $('#'+tabId).data('congaapiname');
	var tabStatus = $('#'+tabId).data('tabstatus');
	var tabOrder = $('#'+tabId).data('taborder');
		
	$('#tab_Modal_headder').html('Update Tab');
	$('#tab_Modal_button').html('Update');
	$('#tab_Label_popup').css({"border": "1px solid #ccc"});
	$('#tab_BG_color_popup').css({"border": "1px solid #ccc"});
	$('#tab_BG_color_popup').val(bgColor);            
	$('#tab_Label_popup').val(tabName);
	$('#tab_congaAPI_popup').val(congaApiName);
	$('#tab_status_popup').val(tabStatus);
	$('#tab_isInsert').val(tabOrder);
	readyColorPickar();
	openModel('tab_Modal');
}
	


function isSectionUpdate(secId){        
	var taborder = $('#'+secId).data('taborder');
	var secorder = $('#'+secId).data('secorder');
	var sectionname = $('#'+secId).data('sectionname');
	
	$('#section_Modal_headder').html('Update Section');
	$('#section_Modal_headder').html('Update');
	
	$('#sec_Label_popup').css({"border": "1px solid #ccc"});
	$('#sec_Label_popup').val(sectionname);
	$('#sec_tab_seq_popup').val(taborder);
	$('#sec_sec_seq_popup').val(secorder);
	openModel('section_Modal');
}
	
function isVfpUpdate(vfp_pannelId){
	var taborder = $('#'+vfp_pannelId).data('taborder');
	var secorder = $('#'+vfp_pannelId).data('order');
	var label = $('#'+vfp_pannelId).data('label');
	var temp = $('#'+vfp_pannelId).data('api');//.split('/')
	var api = temp;//temp[temp.length -1];
	var width = $('#'+vfp_pannelId).data('width');
	var height = $('#'+vfp_pannelId).data('height');
	
	$('#vfp_Modal_headder').html('Update VF Page');
	$('#vfp_Modal_button').html('Update');
	
	$('#vfp_Label_popup').css({"border": "1px solid #ccc"});
	$('#vfp_InlineApiName').css({"border": "1px solid #ccc"});
	$('#vfp_width').css({"border": "1px solid #ccc"});
	$('#vfp_height').css({"border": "1px solid #ccc"});
	$('#vfp_Label_popup').val(label);
	$('#vfp_InlineApiName').val(api);
	$('#vfp_width').val(width);
	$('#vfp_height').val(height);
	$('#vfp_tab_seq_popup').val(taborder);
	$('#vfp_sec_seq_popup').val(secorder);
	openModel('vf_page_Modal');
}

function isFieldUpdate(fieldId){
	var fieldapi = $('#'+fieldId).data('fieldapi');
	var fieldlabel = $('#'+fieldId).data('fieldlabel');
	var helptext = $('#'+fieldId).data('helptext');
	var isrequired = $('#'+fieldId).data('isrequired');
	var sectionsequence = $('#'+fieldId).data('sectionsequence');
	var tabsequence = $('#'+fieldId).data('tabsequence');
	var fieldsequence = $('#'+fieldId).data('fieldsequence');
	
	$('#field_Modal_headder').html('Update Field');
	$('#field_Modal_button').html('Update');
	
	$('#field_Label_popup').css({"border": "1px solid #ccc"});
	$('#field_apiName_popup').css({"border": "1px solid #ccc"});
	$('#field_Label_popup').val(fieldlabel);
	$('#field_apiName_popup').val(fieldapi);
	$('#field_helpText_popup').val(helptext);
	$('#field_checkbox_popup').prop("checked",isrequired);
	$('#field_tab_seq_popup').val(tabsequence);
	$('#field_sec_seq_popup').val(sectionsequence);
	$('#field_field_seq_popup').val(fieldsequence);
	openModel('field_Modal');
}

function isGlanceUpdate(glanceId){
	var fieldapi = $('#'+glanceId).data('fieldapi');
	var fieldlabel = $('#'+glanceId).data('fieldlabel');
	var fieldsequence = $('#'+glanceId).data('fieldorder');
	
	$('#glance_field_Modal_headder').html('Update Field');
	$('#glance_field_Modal_button').html('Update');
	$('#glance_Label_popup').css({"border": "1px solid #ccc"});
	$('#glance_apiName_popup').css({"border": "1px solid #ccc"});
	$('#glance_Label_popup').val(fieldlabel);
	$('#glance_apiName_popup').val(fieldapi);
	$('#glance_field_seq_popup').val(fieldsequence);
	openModel('glance_field_Modal');
}
	
function isButtonUpdate(buttonId){            
	var buttonLabel = $('#'+buttonId).data('label');
	var apiName = $('#'+buttonId).data('apiname');
	var action = $('#'+buttonId).data('action');
	var jsaction = $('#'+buttonId).data('actionjs');
	var buttonSeq = $('#'+buttonId).data('sequence');
	
	$('#custom_Buttom_Modal_headder').html('Update Button');
	$('#custom_Buttom_Modal_button').html('Update');
	$('#button_Label_popup').val(buttonLabel);
	$('#button_apiName_popup').val(apiName);
	$('#button_action_popup').val(action);
	$('#button_jsaction_popup').val(jsaction);
	$('#button_field_seq_popup').val(buttonSeq);
	$('#button_Label_popup').css({"border": "1px solid #ccc"});
	$('#button_apiName_popup').css({"border": "1px solid #ccc"});
	$('#button_action_popup').css({"border": "1px solid #ccc"});            
	openModel('custom_Buttom_Modal');
}

function isRelatedLstUpdate(rearrangeId){
	
	var relatedLstLabel = $('#'+rearrangeId).data('label');
	var relatedLstName = $('#'+rearrangeId).data('listapiname');
	var relatedLstObjApi = $('#'+rearrangeId).data('objectapiname');
	var relatedLstAppSubmit = $('#'+rearrangeId).data('aprovalsubmit');
	var relatedLstSeq = $('#'+rearrangeId).data('order');
	
	$('#relatedLst_modal_header').html('Update Releted List');
	$('#relatedLst_pop_button').html('Update');
	
	$('#relatedLst_Label_popup').val(relatedLstLabel);
	$('#relatedLst_apiName_popup').val(relatedLstName);
	$('#relatedLst_obgapi_popup').val(relatedLstObjApi);
	$('#relatedLst_checkbox_popup').prop("checked",relatedLstAppSubmit);
	$('#relatedLst_seq_popup').val(relatedLstSeq);
	$('#relatedLst_Label_popup').css({"border": "1px solid #ccc"});
	$('#relatedLst_apiName_popup').css({"border": "1px solid #ccc"});
	$('#relatedLst_obgapi_popup').css({"border": "1px solid #ccc"});           
	openModel('relatedLst_Modal');
}
	
function openTabRearrangeModel(){
	$('#rearrange_tab_type').val('tab');
	$('#tab_dragable_Modal_header').html('Rearrange Tabs');
	openModel('tab_dragable_Modal');
	tabRearrange();
}
	
function openSecRearrangeModel(tabNo){
	$('#rearrange_tab_type').val('sec');
	$('#rearrange_tab_sequence').val(tabNo);
	$('#tab_dragable_Modal_header').html('Rearrange Sections');
	openModel('tab_dragable_Modal');
	SecRearrange(tabNo);
}
	
function openVfpRearrangeModel(tabNo){
	$('#rearrange_tab_type').val('vfp');
	$('#rearrange_tab_sequence').val(tabNo);
	$('#tab_dragable_Modal_header').html('Rearrange Sections');
	openModel('tab_dragable_Modal');
	vfpRearrange(tabNo);
}
	
function saveTabArrange(){
	var tabArrangeString ='';
	var tabNumber = $('#rearrange_tab_sequence').val();
	var type = $('#rearrange_tab_type').val();
	$('#rearrange_tab_type').val('');
	$('#rearrange_tab_sequence').val('');
	$('#tabrearrangeul li').each(function() {
		tabArrangeString += $(this).data('unique')+',';
	});
	if(type== 'sec' && tabNumber!=''){
		applySecRearrange(tabArrangeString,tabNumber);
	}else if(tabNumber=='' && type== 'sec'){
		alert('Something went wrong.');
	}
	
	if(type== 'vfp' && tabNumber!=''){
		applyVfpRearrange(tabArrangeString,tabNumber);
	}else if(tabNumber=='' && type== 'vfp'){
		alert('Something went wrong.');
	}
	
	if(type=='tab'){
		applytabRearrange(tabArrangeString);
	}
}

function openFieldRearrangeModel(tabSeq, secSeq){
	$('#rearrange_field_tab_sequence').val(tabSeq);
	$('#rearrange_field_sec_sequence').val(secSeq);
	$('#rearrange_field_type').val('field');
	openModel('field_dragable_Modal');
	fieldRearrange(tabSeq, secSeq);
}

function openButtonRearrangeModel(){            
	$('#rearrange_button_type').val('button');
	$('#button_dragable_Modal_header').html('Rearrange Button');
	openModel('button_dragable_Modal');
	buttonRearrange();
}
	
function openGlanceRearrangeModel(){            
	$('#rearrange_field_type').val('glance');
	openModel('field_dragable_Modal');
	glanceRearrange();
}
	
function openRelatedLtsRearrangeModel(){
	$('#rearrange_button_type').val('relatedlst');
	$('#button_dragable_Modal_header').html('Rearrange Related List');
	openModel('button_dragable_Modal');
	relatedLstRearrange();
}

function saveFieldArrange(){
	var fieldRearrangeString = '';
	var tabNumber = $('#rearrange_field_tab_sequence').val();
	var secNumber = $('#rearrange_field_sec_sequence').val();
	var type = $('#rearrange_field_type').val();
	
	$('#rearrange_field_tab_sequence').val('');
	$('#rearrange_field_sec_sequence').val('');
	$('#rearrange_field_type').val('');
	
	$('#fieldrearrangeul li').each(function() {
		fieldRearrangeString += $(this).data('unique')+',';		
	});
	
	if(type=='field'){
		applyFieldRearrange(fieldRearrangeString, tabNumber, secNumber);
	}else if(type=='glance'){
		applyGlanceRearrange(fieldRearrangeString);
	}
}
	
function saveButtonArrange(){
	var fieldRearrangeString = '';
	var type = $('#rearrange_button_type').val();
	$('#rearrange_button_type').val('');
	
	$('#buttonrearrangeul li').each(function() {
		fieldRearrangeString += $(this).data('unique')+',';
	});
	
	if(type=='button'){
		applyButtonRearrange(fieldRearrangeString);
	}else if(type=='relatedlst'){
		applyrelatedLstRearrange(fieldRearrangeString);
	}
}
	
function closeRearrange(type){
	if(type=='tab'){
		$('#rearrange_tab_sequence').val('');
		closeModel('tab_dragable_Modal');
	}else if(type=='field'){
		$('#rearrange_field_tab_sequence').val('');
		$('#rearrange_field_sec_sequence').val('');
		closeModel('field_dragable_Modal');
	}else if(type=='button'){
		$('#rearrange_button_type').val('');
		closeModel('button_dragable_Modal');
	}
}