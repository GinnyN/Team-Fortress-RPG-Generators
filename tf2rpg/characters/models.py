from django.db import models

# Create your models here.
class Steam(models.Model):
    steamId = models.CharField(max_length=300)
    userId = models.CharField(max_length=300)
    name = models.CharField(max_length=300)
    avatar = models.CharField(max_length=1000)

class Character(models.Model):
	user = models.ForeignKey(Steam)
	name = models.CharField(max_length=200)
	age = models.IntegerField()
	gender = models.CharField(max_length=200)

class Level(models.Model):
	character = models.ForeignKey(Character)
	level = models.IntegerField()
	playerClass = models.CharField(max_length=100)
	points = models.IntegerField()
	pointLeft = models.IntegerField()
	agility = models.IntegerField()
	constitucion = models.IntegerField()
	dexterity = models.IntegerField()
	strenght = models.IntegerField()
	inteligence = models.IntegerField()
	power = models.IntegerField()
	will = models.IntegerField()
	perception = models.IntegerField()
	turn = models.IntegerField()
	hpmultipliers = models.IntegerField()
	attack = models.IntegerField()
	defense = models.IntegerField()

class Secondary(models.Model):
	level = models.ForeignKey(Level)
	name = models.CharField(max_length=200)
	base = models.IntegerField()
	classBonus = models.IntegerField()
	dependency = models.CharField(max_length=200)

class Table(models.Model):
	level = models.ForeignKey(Level)
	name = models.CharField(max_length=200)
	type = models.CharField(max_length=200)
	slot = models.CharField(max_length=200, blank = True)