from django.http import HttpResponse
from django.template import Context, loader
from django.utils.html import escape
from django.contrib.auth.decorators import login_required
from social_auth.models import UserSocialAuth
from characters.models import Steam, Character

def new(request):
	steam = Steam.objects.get(userId = request.user.username)
	char = Character(user = steam)
	char.save()
	char.name = "Character Nro: "+char.id
	char.save()
	return redirect('characters/'+char.id+'/')