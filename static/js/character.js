var points;
var pointsTotal;

$(document).on("ready",ready);

function ready()
{
	$("#personal-information").on("submit",personal);
	$(".level-form").on("submit",class_change);
	$("#weapons-tables").on("submit",weapon_tables_submit);

	$("#weapons-div .weapons .weapon").on("change", apply_weapons);

	points = parseInt($("#levels-div #points").text());
	pointsTotal = parseInt($("#levels-div #pointsTotal").text().split("/")[1]);
	misc();
	apply_class();
	activate_downgrade();
	$("#tables-div .close").on("click", remove_table);

	$("#save").on("click", save);
}

function save()
{
	misc1 = new Array();

	$("#misc-list tr").each(function(y, obj){
		misc1[y] = {
			name: $(obj).find(".name").text().split(":")[0],
			base: parseInt($(obj).find(".base").text())
		}
	});

	$.ajax({
		type : 'POST',
		data: {
				csrfmiddlewaretoken: $("input[name='csrfmiddlewaretoken']").val(),
				agility: parseInt($("#agility .totals").text()), 
				dexterity: parseInt($("#dexterity .totals").text()), 
				constitution: parseInt($("#constitution .totals").text()), 
				strength: parseInt($("#strength .totals").text()), 
				inteligence: parseInt($("#inteligence .totals").text()), 
				power: parseInt($("#power .totals").text()),
				will: parseInt($("#will .totals").text()),
				perception: parseInt($("#perception .totals").text()),  
				hpMultipliers: parseInt($("#secondary-div #movement-type .hp .multipliers").text()),
				attack: parseInt($("#fighting-abilities .attack .base").text()),
				defense: parseInt($("#fighting-abilities .defense .base").text()), 
				level: parseInt($("[name='level']").val()),
				points: parseInt($("#points").text()),
				misc: JSON.stringify(misc1)
			},
		url : $("#save-url").attr("value"),
		success: function(){
			
		}
	});
}

function weapon_tables_submit(event)
{
	event.preventDefault()

	if($(this).children("[name='tables_list']").find("option[value='"+$(this).children("[name='tables_list']").val()+"']").hasClass("weapon"))
	{
		type = "weapon";
		cost = 20;
		slot = $(this).children("[name='tables_list']").find("option[value='"+$(this).children("[name='tables_list']").val()+"']").attr("class").split("weapon ")[1];
	}
	else if($(this).children("[name='tables_list']").find("option[value='"+$(this).children("[name='tables_list']").val()+"']").hasClass("typology"))
	{
		type = "typology";
		cost = 50;
		slot = "";
	}
	else if($(this).children("[name='tables_list']").find("option[value='"+$(this).children("[name='tables_list']").val()+"']").hasClass("technique"))
	{
		type = "technique"
		cost = 50;
		slot = "";
	}
	else
	{
		type = "table";
		cost = parseInt($(this).children("input[value='"+$(this).children("[name='tables_list']").val()+"']").attr("class"));
		slot = "";
	}

	$.ajax({
		type : 'POST',
		data: {csrfmiddlewaretoken: $(this).find("div input[name='csrfmiddlewaretoken']").val(), name: $(this).children("[name='tables_list']").val(), level: $(this).children("[name='level']").val(), slot: slot, type: type},
		url : $(this).attr("action"),
		success: function(){
			
		}
	});

	$("#tables-div #table-collection").append("<div class='"+type+" "+slot+"'>"+$(this).children("[name='tables_list']").val()+"<span class='close ui-icon ui-icon-close'></span></div>");
	$("#tables-div ."+type+" .close").on("click", remove_table);

	points = points - cost;
	$("#levels-div #points").text(points);

	if($("#levels-div #points").text() == "0")
		upgrade_offs();

	weapon_tables();
}

function remove_table()
{
	$.ajax({
		type : 'POST',
		data: {csrfmiddlewaretoken: $("input[name='csrfmiddlewaretoken']").val(), name: $(this).parent().text(), level: $("[name='level']").val() },
		url : $("#remove-table-url").attr("value"),
		success: function(){
			
		}
	});

	if($(this).parent().hasClass("weapon"))
	{
		type = "weapon";
		cost = 20;
	}
	else if($(this).parent().hasClass("typology"))
	{
		type = "typology";
		cost = 50;
	}
	else if($(this).parent().hasClass("technique"))
	{
		type = "technique"
		cost = 50;
	}
	else
	{
		type = "table";
		cost = parseInt($("input[value='"+$(this).parent().text()+"']").attr("class"));
	}

	points = points + cost;
	$("#levels-div #points").text(points);

	$(this).parent().remove();

	weapon_tables();
}

function personal(event)
{
	event.preventDefault()

	$.ajax({
		type : 'POST',
		data: {csrfmiddlewaretoken: $(this).find("div input[name='csrfmiddlewaretoken']").val(), name: $(this).children("[name='name']").val(), age: $(this).children("[name='age']").val(), gender: $(this).children("[name='gender']").val() },
		url : $(this).attr("action"),
		dataType: 'json',
		success: function(result){
		}
	});
}

function class_change(event)
{
	event.preventDefault()

	$.ajax({
		type : 'POST',
		data: {csrfmiddlewaretoken: $(this).find("div input[name='csrfmiddlewaretoken']").val(), level: $(this).children("[name='level']").val(), class: $(this).children("[name='class']").val() },
		url : $(this).attr("action"),
		dataType: 'json',
		success: function(result){
		}
	});

	apply_class();
}

function apply_class()
{
	$("#strength .totals .heavy").text("0");

	$("#strength .totals .total").text(parseInt($("#strength .totals .heavy").text()) + parseInt($("#strength .totals .real").text()) );

	$("#tables-div .classBonus").remove();
	$("#misc-list td.total .classBonus").text("");

	$("#weapons-div .slot-1 .weapon-primary .classBonus").remove();
	$("#weapons-div .slot-2 .weapon-secondary .classBonus").remove();
	$("#weapons-div .slot-3 .weapon-melee .classBonus").remove();

	$.ajax({
		url : $("#levels-div .json-url").val(),
		dataType: 'json',
		success: function(result){

			object = result.classes[$("select.class").val()];

			$("#fighting-abilities .defense .classBonus").text(object.bonus.defense);
			$("#fighting-abilities .attack .classBonus").text(object.bonus.attack);
			$("#movement-type .turn .classBonus").text(object.bonus.turn);
			$("#movement-type .hp .classBonus").text(object.bonus.hp);

			$.each(object.tables, function(i, obj){
				$("#tables-div #table-collection").append("<div class='"+obj.type+" classBonus'>"+obj.name+"<br/></div>");
			});

			$.each($("#misc-list tr"), function (i, obj){
				$(obj).find(".classBonus").text("0");
				$.each(object.secondaries, function(y, obj1){
					if ($(obj).find(".name").text().split(":")[0] == obj1.name)
						$(obj).find(".classBonus").text(obj1.bonus);
				})
			});

			if($("select.class").val() == "heavy")
			{
				$("#strength .totals .heavy").text("6");
				$("#strength .totals .total").text(parseInt($("#strength .totals .heavy").text()) + parseInt($("#strength .totals .real").text()) )
			}

			primaries();
			secondaries();
			weapon_tables();
			apply_misc();
		}
	});
}

function misc()
{
	$.ajax({
		type : 'POST',
		data: {csrfmiddlewaretoken: $("input[name='csrfmiddlewaretoken']").val(), classSelected: $("select[name='class']").val(), level: parseInt($("[name='level']").val()) },
		url : $("#misc-url").attr("value"),
		dataType: 'html',
		success: function(result_misc){
			$("#misc-list").html(result_misc);

			apply_misc();

		}
	});
}

function apply_misc()
{
	$("#misc-list tr").each(
		function(){
			
			sum_misc(this);

			if(points != 0)
				$(this).find(".flechas .up").off().on("click", upgrade_misc);
			if(parseInt($(this).find(".total .base").text()) > 0)
				$(this).find(".flechas .up").off().on("click", downgrade_misc);
		}
	);
}

function sum_misc(obj)
{
	if(parseInt($(obj).find(".total .classBonus").text()) != NaN)
		classBonus = parseInt($(obj).find(".total .classBonus").text());
	else
		classBonus = 0;

	attr = $(obj).attr("class");

	attrBonus = parseInt($("#"+attr.split('"')[0]+' .bonus').text());

	$(obj).find(".total .total").text(parseInt($(obj).find(".total .base").text()) + classBonus + attrBonus);
}

function apply_weapons()
{
	$.ajax({
		url : $("#url-json").val(),
		dataType: 'json',
		success: function(result){
			$("#weapons-div .weapons").each(function(){
				if($(this).hasClass("slot-1"))
					position = "primary";
				else if($(this).hasClass("slot-2"))
					position = "secondary";
				else
					position = "melee"
				
				find = $(this).find(".weapon").val();

				 $.each(result.weapons[position], function(i, h){
					$.each(h.weapons, function(y, j){
						if(j.name == find)
							object = j;
					});
				});

				$(this).find(".normal .normal").text(object.damage_multiplier);
				$(this).find(".normal .crits").text(Math.round(object.damage_multiplier * 3 * 10)/10);
				$(this).find(".normal .mini-crits").text(Math.round(object.damage_multiplier * 1.33333333333333 * 10)/10);

				$(this).find(".point-blank .normal").text(object.damage_point_blank);
				$(this).find(".point-blank .crits").text(Math.round(object.damage_point_blank * 3 * 10)/10);
				$(this).find(".point-blank .mini-crits").text(Math.round(object.damage_point_blank * 1.33333333333333 * 10)/10);

				$(this).find(".over-100 .normal").text(object.damage_over_100);
				$(this).find(".over-100 .crits").text(Math.round(object.damage_over_100 * 3 * 10)/10);
				$(this).find(".over-100 .mini-crits").text(Math.round(object.damage_over_100 * 1.33333333333333 * 10)/10);

				$(this).find(".active-action-attack").text(object.active_action_attack);
				$(this).find(".clip-size").text(object.clip_size);
				$(this).find(".full-turn-attack").text(object.full_turn_attack);
				$(this).find(".load-time").text(object.load_time);

				$(this).find(".notes").html("Notes: "+object.notes);
			});

			table = result.weapons;

			$.each(table.primary, function(i , obj2){
				$.each(obj2.weapons, function(i , obj1){
					$("#tables-div #weapons-tables #tables_list").append("<option value='"+obj1.name+"' class='weapon primary'>"+obj1.name+"</option>");
				});
			});

			$.each(table.secondary, function(i , obj2){
				$.each(obj2.weapons, function(i , obj1){
					$("#tables-div #weapons-tables #tables_list").append("<option value='"+obj1.name+"' class='weapon secondary'>"+obj1.name+"</option>");
				});
			});

			$.each(table.melee, function(i , obj2){
				$.each(obj2.weapons, function(i , obj1){
					$("#tables-div #weapons-tables #tables_list").append("<option value='"+obj1.name+"' class='weapon melee'>"+obj1.name+"</option>");
				});
			});
		}
	});
}

function weapon_tables()
{
	$.ajax({
		url : $("#url-json-tables").val(),
		dataType: 'json',
		success: function(result){

			$("#weapons-div .slot-1 .weapon-primary").html("");
			$("#weapons-div .slot-2 .weapon-secondary").html("");
			$("#weapons-div .slot-3 .weapon-melee").html("");

			$("#tables-div #table-collection div").each(function(i, tables){
				
				if($(tables).hasClass("weapon"))
				{
					if($(tables).hasClass("primary"))
						$("#weapons-div .slot-1 .weapon-primary").append("<option value='"+$(this).text()+"' class='classBonus'>"+$(this).text()+"</option>");
					else if($(tables).hasClass("secondary"))
						$("#weapons-div .slot-2 .weapon-secondary").append("<option value='"+$(this).text()+"' class='classBonus'>"+$(this).text()+"</option>");
					else if($(tables).hasClass("melee"))
						$("#weapons-div .slot-3 .weapon-melee").append("<option value='"+$(this).text()+"' class='classBonus'>"+$(this).text()+"</option>");
				}
				else if($(tables).hasClass("table"))
				{
					table = result.tables[$(this).text()];

					if(table.primary != undefined)
						$.each(table.primary, function(i, obj){
							$("#weapons-div .slot-1 .weapon-primary").append("<option value='"+obj.name+"' class='classBonus'>"+obj.name+"</option>");
						});

					if(table.secondary != undefined)
						$.each(table.secondary, function(i, obj){
							$("#weapons-div .slot-2 .weapon-secondary").append("<option value='"+obj.name+"' class='classBonus'>"+obj.name+"</option>");
						});

					if(table.melee != undefined)
						$.each(table.melee, function(i, obj){
							$("#weapons-div .slot-3 .weapon-melee").append("<option value='"+obj.name+"' class='classBonus'>"+obj.name+"</option>");
						});
				}
			});

			table = result.tables;

			$("#tables-div #weapons-tables #tables_list").html("");

			$.each(table, function(i , obj){
				$("#tables-div #weapons-tables #tables_list").append("<option value='"+obj.name+"' class='"+obj.class+"'>"+obj.name+"</option>");
				$("#tables-div #weapons-tables").append("<input value='"+obj.name+"' class='"+obj.cost+"' type='hidden' />");
			});

			apply_weapons();

		}
	});
}

function primaries()
{
	$(".primary").each(function(){

		if($(this).hasClass("heavy")) 
			totals = parseInt($("#strength .totals .heavy").text()) + parseInt($("#strength .totals .real").text()) ;
		else
			totals = $(this).find(".totals").text();

		bonus = $(this).find(".bonus");

		if (totals == "0")
			bonus.html("-40");

		else if (totals == "1")
			bonus.html("-30");

		else if (totals == "2")
			bonus.html("-20");

		else if (totals == "3")
			bonus.html("-10");

		else if (totals == "4")
			bonus.html("-5");

		else if (totals == "5")
			bonus.html("0");

		else if (totals == "6" || totals == "7")
			bonus.html("+5");

		else if (totals == "8" || totals == "9")
			bonus.html("+10");

		else if (totals == "10")
			bonus.html("+15");

		else if (totals == "11" || totals == "12" )
			bonus.html("+20");

		else if (totals == "13" || totals == "14")
			bonus.html("+25");

		else if (totals == "15")
			bonus.html("+30");

		else if (totals == "16" || totals == "17" )
			bonus.html("+35");

		else if (totals == "18" || totals == "19")
			bonus.html("+40");
	})
}

function secondaries()
{
	$("#movement-type .value").text($("#agility .totals").text());

	if($("#agility .totals").text() == "1")
		$("#movement-type .movement").text("less than 1 mt");

	else if($("#agility .totals").text() == "2")
		$("#movement-type .movement").text("4 mt");

	else if($("#agility .totals").text() == "3")
		$("#movement-type .movement").text("8 mt");

	else if($("#agility .totals").text() == "4")
		$("#movement-type .movement").text("15 mt");

	else if($("#agility .totals").text() == "5")
		$("#movement-type .movement").text("20 mt");

	else if($("#agility .totals").text() == "6")
		$("#movement-type .movement").text("22 mt");

	else if($("#agility .totals").text() == "7")
		$("#movement-type .movement").text("25 mt");

	else if($("#agility .totals").text() == "8")
		$("#movement-type .movement").text("28 mt");

	else if($("#agility .totals").text() == "9")
		$("#movement-type .movement").text("32 mt");

	else if($("#agility .totals").text() == "10")
		$("#movement-type .movement").text("35 mt");

	else if($("#agility .totals").text() == "11")
		$("#movement-type .movement").text("40 mt");

	$("#movement-type .tiredness-points").text($("#constitution .totals").text());

	$("#movement-type .turn .value").text(parseInt($("#dexterity .bonus").text()) + 20 + parseInt($("#agility .bonus").text()) + parseInt($("#movement-type .turn .classBonus").text()) );

	$("#movement-type .hp .value").text(( parseInt($("#constitution .totals").text()) * ( 10 + parseInt($("#movement-type .hp .multipliers").text()) ) + 20 + parseInt($("#constitution .bonus").text()) + parseInt($("#movement-type .hp .classBonus").text()) ));

	upgrade_clicks();
	calc_hp();
	calc_attack();
	calc_defense();
	
	actions = parseInt($("#agility .totals").text()) + parseInt($("#dexterity .totals").text());

	if(actions < 10)
		$("#movement-type .actions").text("1");
	else if(actions < 14)
		$("#movement-type .actions").text("2");
	else if(actions < 19)
		$("#movement-type .actions").text("3");
	else if(actions < 22)
		$("#movement-type .actions").text("4");
	else if(actions < 25)
		$("#movement-type .actions").text("5");
	else if(actions < 28)
		$("#movement-type .actions").text("6");
	else if(actions < 31)
		$("#movement-type .actions").text("8");
	else
		$("#movement-type .actions").text("10");

	apply_misc();
}

function upgrade_clicks()
{
	$("#movement-type .hp .flechas .up").off().on("click", upgrade_hp);
	$("#fighting-abilities .attack .flechas .up").off().on("click", upgrade_attack);
	$("#fighting-abilities .defense .flechas .up").off().on("click", upgrade_defense);
}

function upgrade_offs()
{
	$("#movement-type .hp .flechas .up").off();
	$("#fighting-abilities .attack .flechas .up").off();
	$("#fighting-abilities .defense .flechas .up").off();
}

function calc_hp()
{
	$("#movement-type .hp .value").text(( parseInt($("#constitution .totals").text()) * ( 10 + parseInt($("#movement-type .hp .multipliers").text()) ) + 20 + parseInt($("#constitution .bonus").text()) + parseInt($("#movement-type .hp .classBonus").text()) ));
}

function calc_attack()
{
	$("#fighting-abilities .attack .value").text( parseInt($("#dexterity .bonus").text()) + parseInt($("#fighting-abilities .attack .base").text()) + parseInt($("#fighting-abilities .attack .classBonus").text()) );
}

function calc_defense()
{
	$("#fighting-abilities .defense .value").text( parseInt($("#agility .bonus").text()) + parseInt($("#fighting-abilities .defense .base").text()) + parseInt($("#fighting-abilities .defense .classBonus").text()) );
}

function upgrade_hp()
{
	actual = parseInt($("#movement-type .hp .multipliers").text());
	$("#movement-type .hp .multipliers").text( actual + 1);
	
	points = points - 10;
	$("#levels-div #points").text(points);

	if($("#levels-div #points").text() == "0")
		upgrade_offs();

	$("#movement-type .hp .flechas .down").off().on("click",downgrade_hp);
	
	calc_hp();
}

function upgrade_misc()
{
	actual = parseInt($(this).parent().parent().find(".total .base").text());
	$(this).parent().parent().find(".total .base").text(actual + 1);
	
	points = points - 1;
	$("#levels-div #points").text(points);

	if($("#levels-div #points").text() == "0")
		upgrade_offs();

	$(this).parent().find(".down").off().on("click",downgrade_misc);
	
	sum_misc($(this).parent().parent());
}

function upgrade_attack()
{
	actual = parseInt($("#fighting-abilities .attack .base").text());
	$("#fighting-abilities .attack .base").text(actual + 1);
	
	points = points - 1;
	$("#levels-div #points").text(points);

	if($("#levels-div #points").text() == "0")
		upgrade_offs();

	$("#fighting-abilities .attack .flechas .down").off().on("click",downgrade_attack);
	
	calc_attack();
}

function upgrade_defense()
{
	actual = parseInt($("#fighting-abilities .defense .base").text());
	$("#fighting-abilities .defense .base").text(actual + 1);
	
	points = points - 1;
	$("#levels-div #points").text(points);

	if($("#levels-div #points").text() == "0")
		upgrade_offs();

	$("#fighting-abilities .defense .flechas .down").off().on("click",downgrade_defense);
	
	calc_defense();
}

function activate_downgrade()
{
	if (($("#fighting-abilities .defense .base").text() != 0) && pointsTotal > points)
		$("#fighting-abilities .defense .flechas .down").off().on("click",downgrade_defense);

	if (($("#movement-type .hp .multipliers").text() != 0) && pointsTotal > points)
		$("#movement-type .hp .flechas .down").off().on("click",downgrade_hp);

	if (($("#fighting-abilities .attack .base").text() != 0) && pointsTotal > points)
		$("#fighting-abilities .attack .flechas .down").off().on("click",downgrade_attack);
}
function downgrade_hp()
{
	actual = parseInt($("#movement-type .hp .multipliers").text());
	$("#movement-type .hp .multipliers").text( actual - 1);
	
	points = points + 10;
	$("#levels-div #points").text(points);

	if($("#movement-type .hp .multipliers").text() == "1")
		$("#movement-type .hp .flechas .down").off();

	upgrade_clicks();
	
	calc_hp();
}

function downgrade_misc()
{
	actual = parseInt($(this).parent().parent().find(".total .base").text());
	$(this).parent().parent().find(".total .base").text(actual - 1);
	
	points = points + 1;
	$("#levels-div #points").text(points);

	if($(this).parent().parent().find(".total .base").text() == "0")
		$(this).parent().find(".down").off();

	upgrade_clicks();
	
	sum_misc($(this).parent().parent());
}

function downgrade_attack()
{
	actual = parseInt($("#fighting-abilities .attack .base").text());
	$("#fighting-abilities .attack .base").text(actual - 1);
	
	points = points + 1;
	$("#levels-div #points").text(points);

	if($("#fighting-abilities .attack .base").text() == "0")
		$("#fighting-abilities .attack .flechas .down").off();

	upgrade_clicks();
	
	calc_attack();
}

function downgrade_defense()
{
	actual = parseInt($("#fighting-abilities .defense .base").text());
	$("#fighting-abilities .defense .base").text(actual - 1);
	
	points = points + 1;
	$("#levels-div #points").text(points);

	if($("#fighting-abilities .defense .base").text() == "0")
		$("#fighting-abilities .defense .flechas .down").off();

	upgrade_clicks();
	
	calc_defense();
}