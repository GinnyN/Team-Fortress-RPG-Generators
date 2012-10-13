import requests

from django.http import HttpResponse, HttpResponseRedirect
from django.template import Context, loader
from django.utils.html import escape
from django.contrib.auth.decorators import login_required
from social_auth.models import UserSocialAuth
from characters.models import Steam, Character, Level, Table, Secondary
from django.conf import settings
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.utils import simplejson as json
from django.core import serializers

def new(request):
	if request.user.is_anonymous():
		return render_to_response('tf2rpg/index.html', {}, context_instance=RequestContext(request))

	if request.user.is_authenticated():
		steam = Steam.objects.get(userId = request.user.id)
		char = Character(user = steam, name=" ", age=0, gender="Male")
		char.save()
		char.name = "Character Nro: "+str(char.id)
		char.save()
		return HttpResponseRedirect(settings.SITE_URL+'/characters/'+str(char.id)+'/first_level')
	else:
		return render_to_response('tf2rpg/index.html', {}, context_instance=RequestContext(request))

def personal_update(request, character_id):
	if request.user.is_anonymous():
		return render_to_response('tf2rpg/index.html', {}, context_instance=RequestContext(request))

	char = Character.objects.get(id = character_id)
	char.name = request.POST.get("name") 
	char.age = request.POST.get("age")
	char.gender = request.POST.get("gender")
	char.save()
	
	return HttpResponse(True)

def create(request, character_id):
	if request.user.is_anonymous():
		return render_to_response('tf2rpg/index.html', {}, context_instance=RequestContext(request))
	
	steam = Steam.objects.get(userId = request.user.id)
	char = Character.objects.get(id = character_id)
	level = Level(character = char, level= 1, points = 600, pointLeft = 600, agility = request.GET.get("agility"), constitucion =  request.GET.get("constitucion"), dexterity = request.GET.get("dexterity"), strenght = request.GET.get("strength"), inteligence = request.GET.get("inteligence"), power = request.GET.get("power"), will = request.GET.get("will"), perception = request.GET.get("perception"), turn = 0, hpmultipliers = 1, attack = 0, defense = 0)
	level.save()
	
	return HttpResponseRedirect(settings.SITE_URL+'/characters/'+str(char.id)+'/')

def level_update(request, character_id):
	if request.user.is_anonymous():
		return render_to_response('tf2rpg/index.html', {}, context_instance=RequestContext(request))
	
	steam = Steam.objects.get(userId = request.user.id)
	char = Character.objects.get(id = character_id)
	level = Level.objects.get(character = char, level= request.POST.get("level"))
	level.playerClass = request.POST.get("class")
	level.save()
	
	return HttpResponse(True)

def weaponTablesAdd(request, character_id):
	if request.user.is_anonymous():
		return render_to_response('tf2rpg/index.html', {}, context_instance=RequestContext(request))

	steam = Steam.objects.get(userId = request.user.id)
	char = Character.objects.get(id = character_id)
	level = Level.objects.get(character = char, level= request.POST.get("level"))
	table = Table(level = level, name = request.POST.get("name"), type = request.POST.get("type"), slot = request.POST.get("slot"))
	table.save()

	return HttpResponse(True)

def weaponTablesRemove(request, character_id):
	if request.user.is_anonymous():
		return render_to_response('tf2rpg/index.html', {}, context_instance=RequestContext(request))

	steam = Steam.objects.get(userId = request.user.id)
	char = Character.objects.get(id = character_id)
	level = Level.objects.get(character = char, level= request.POST.get("level"))
	Table.objects.filter(level = level, name = request.POST.get("name")).delete()

	return HttpResponse(True)

def save(request, character_id):
	if request.user.is_anonymous():
		return render_to_response('tf2rpg/index.html', {}, context_instance=RequestContext(request))

	steam = Steam.objects.get(userId = request.user.id)
	char = Character.objects.get(id = character_id)
	level = Level.objects.get(character = char, level= request.POST.get("level"))

	level.pointLeft = request.POST.get("points")
	level.agility = request.POST.get("agility")
	level.constitucion = request.POST.get("constitution")
	level.dexterity = request.POST.get("dexterity")
	level.strenght = request.POST.get("strength")
	level.inteligence = request.POST.get("inteligence")
	level.power = request.POST.get("power")
	level.will = request.POST.get("will")
	level.perception = request.POST.get("perception")
	level.hpmultipliers = request.POST.get("hpMultipliers")
	level.attack = request.POST.get("attack")
	level.defense = request.POST.get("defense")
	level.save()

	secondaries = Secondary.objects.filter(level = level)
	misc = json.loads(request.POST.get("misc"))

	count = 0
	while (count < len (misc)):
		secondary = secondaries.get(name=misc[count]["name"])
		secondary.base = misc[count]["base"]
		secondary.save()
		count = count + 1

	return HttpResponse(misc[1]["name"])
