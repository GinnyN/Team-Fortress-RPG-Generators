#import requests
import urllib2

from django.http import HttpResponse, HttpResponseRedirect
from django.template import Context, loader
from django.utils.html import escape
from django.contrib.auth.decorators import login_required
from social_auth.models import UserSocialAuth
from characters.models import Steam, Character, Level, Secondary
from django.conf import settings
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.utils import simplejson as json

def weapon_info(request):
	#r = requests.get(settings.STATIC_URL+'/json/weapons.json')
	r = urllib2.Request(settings.STATIC_URL+'/json/weapons.json')
	opener = urllib2.build_opener()
	f = opener.open(r)
	r = json.load(f)

	return HttpResponse(json.dumps(r), mimetype="application/json") 

def class_info(request):
	#r = requests.get(settings.STATIC_URL+'/json/classes.json')
	r = urllib2.Request(settings.STATIC_URL+'/json/classes.json')
	opener = urllib2.build_opener()
	f = opener.open(r)
	r = json.load(f)
	return HttpResponse(json.dumps(r), mimetype="application/json") 

def weapon_tables(request):
	#r = requests.get(settings.STATIC_URL+'/json/weaponTables.json')
	r = urllib2.Request(settings.STATIC_URL+'/json/weaponTables.json')
	opener = urllib2.build_opener()
	f = opener.open(r)
	r = json.load(f)
	return HttpResponse(json.dumps(r), mimetype="application/json") 

def misc(request, character_id):
	char = Character.objects.get(id = character_id)
	level = Level.objects.get(character = char, level = request.POST.get("level"))

	if Secondary.objects.filter(level = level).exists(): 
		secondaries = Secondary.objects.filter(level = level)
	else:  
		#r = requests.get(settings.STATIC_URL+'/json/misc.json')
		r = urllib2.Request(settings.STATIC_URL+'/json/misc.json')
		opener = urllib2.build_opener()
		f = opener.open(r)
		r = json.load(f)
		j = r["misc"]	
		
		#classes = requests.get(settings.STATIC_URL+'/json/classes.json')
		r = urllib2.Request(settings.STATIC_URL+'/json/classes.json')
		opener = urllib2.build_opener()
		f = opener.open(r)
		r = json.load(f)

		classBonus = r["classes"][request.POST.get("classSelected")]["secondaries"]

		count = 0
		for key, value in j:
			secondaries = Secondary(level = level, name = j[count]["name"], base = 0, classBonus = 0, dependency = j[count]["depends"])
			secondaries.save()
			count = count + 1

		count = 0
		while (count < len (classBonus)):
			secondaries = Secondary.objects.get(level = level, name=classBonus[count]["name"])
			secondaries.classBonus = classBonus[count]["bonus"]
			secondaries.save()
			count = count + 1
		
		secondaries = Secondary.objects.filter(level = level)
		
	t = loader.get_template('tf2rpg/characters/misc.html')
	c = RequestContext(request,{
		'misc': secondaries
	})

	return HttpResponse(t.render(c))
#	return HttpResponse(r)
