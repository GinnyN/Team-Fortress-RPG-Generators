import requests

from django.http import HttpResponseRedirect
from django.http import HttpRequest
from social_auth.models import UserSocialAuth, SOCIAL_AUTH_MODELS_MODULE
from social_auth.backends.exceptions import AuthAlreadyAssociated
from django.utils.translation import ugettext
from pprint import pprint
from characters.models import Steam
from django.conf import settings
from django.db import models
from django.contrib.auth.models import User

def steam(request, *args, **kwargs):
	try:
		steam = Steam.objects.get(userId = request.user.social_auth.uid)
	except Steam.DoesNotExist:   
		steam = Steam(steamId= request.GET.get("openid.claimed_id","not found"), userId = request.user.social_auth.uid)
    
	steamId = steam.steamId.partition("http://steamcommunity.com/openid/id/")
	r = requests.get('http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key='+settings.STEAM_HASH+'&steamids='+steamId[2])
	steam.name = r.json["response"]["players"][0]["personaname"] 
	steam.avatar = r.json["response"]["players"][0]["avatarfull"] 


	return request
    
