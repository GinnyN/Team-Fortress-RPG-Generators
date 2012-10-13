# Create your views here.
import pprint
import requests

from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth import logout
from django.template import Context, loader
from django.utils.html import escape
from django.contrib.auth.decorators import login_required
from social_auth.models import UserSocialAuth
from characters.models import Steam, Character, Level, Table
from django.conf import settings
from django.shortcuts import render_to_response, render
from django.template import RequestContext
from django.db.models import Max

def indice(request):
    if request.user.is_authenticated():
        return HttpResponseRedirect(settings.SITE_URL+'/characters/')
    else:
        return render_to_response('tf2rpg/index.html', {}, context_instance=RequestContext(request))

def info(request):
    if request.user.is_anonymous():
        return render_to_response('tf2rpg/index.html', {}, context_instance=RequestContext(request))

    try:
       steam = Steam.objects.get(steamId = request.user.social_auth.get(user_id = request.user.id).uid)
    except Steam.DoesNotExist: 
       steam = Steam(steamId = request.user.social_auth.get(user_id = request.user.id).uid, userId = request.user.id, name = "Hola", avatar = "Hola") 
    
    steamId = steam.steamId.partition("http://steamcommunity.com/openid/id/")
    r = requests.get('http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key='+settings.STEAM_HASH+'&steamids='+steamId[2])
    steam.name = r.json["response"]["players"][0]["personaname"] 
    steam.avatar = r.json["response"]["players"][0]["avatarfull"] 
    steam.save()

    t = loader.get_template('tf2rpg/characters/game.html')
    c = RequestContext(request,{
        'name': steam.name,
        'avatar': steam.avatar,
    })

    return HttpResponse(t.render(c))

def character(request, character_id):
    if request.user.is_anonymous():
        return render_to_response('tf2rpg/index.html', {}, context_instance=RequestContext(request))

    steam = Steam.objects.get(steamId = request.user.social_auth.get(user_id = request.user.id).uid)
    char = Character.objects.get(id = character_id)
    try:
        maxLeveles = Level.objects.filter(character = char)
        if maxLeveles.exists():
            maxLevel = maxLeveles.aggregate(Max("level"))["level__max"]
            levels = Level.objects.get(character = char, level=maxLevel)
        else:
            levels = Level.objects.get(character = char, level=1)
        tables = Table.objects.filter(level = levels)
    except Level.DoesNotExist:   
        levels = Level()
        tables = []

    t = loader.get_template('tf2rpg/characters/complete_view.html')
    c = RequestContext(request, {
        'steam': steam,
        'char': char,
        'level': levels,
        'tables': tables
    })


    return HttpResponse(t.render(c))

def first_level(request, character_id):
    if request.user.is_anonymous():
        return render_to_response('tf2rpg/index.html', {}, context_instance=RequestContext(request))

    steam = Steam.objects.get(steamId = request.user.social_auth.get(user_id = request.user.id).uid)
    char = Character.objects.get(id = character_id)
    t = loader.get_template('tf2rpg/characters/first_level.html')
    c = RequestContext(request,{
        'name': steam.name,
        'avatar': steam.avatar,
        'char': char,
    })

    return HttpResponse(t.render(c))