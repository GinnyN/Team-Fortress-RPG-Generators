from django.db import models
from characters.models import Character, Steam

# Create your models here.

class Weapon(models.Model):
	player = models.ForeignKey(Steam)
	char = models.ForeignKey(Character, blank = True)
	name = models.CharField(max_length=300)
	type_of_damage = models.CharField(max_length=300)
	damage_multiplier = models.FloatField()
	damage_point_blank = models.FloatField()
	damage_over_100 = models.FloatField()
	active_action_attack = models.CharField(max_length=300)
	full_turn_attack = models.CharField(max_length=300)
	clip_size = models.CharField(max_length=300)
	load_time = models.CharField(max_length=300)
	notes = models.TextField(blank=True)
	