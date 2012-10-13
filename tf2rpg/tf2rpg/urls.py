from django.conf.urls import patterns, include, url
from django.views.generic.simple import direct_to_template

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',

    #Log in
    url(r'^$', "characters.views.indice", name="characters-indice"),

    #Log out
    url(r'^logout/$',  'django.contrib.auth.views.logout', {'next_page': '/'}),
    
    #Index
    url(r'^characters/$', "characters.views.info", name="characters-index"),
    
    #Character JSON
    url(r'^characters/weaponInfo/$', "characters.json.weapon_info", name="characters-weapon_info"),
    url(r'^characters/classInfo/$', "characters.json.class_info", name="characters-class_info"),
    url(r'^characters/weaponTables/$', "characters.json.weapon_tables", name="characters-weapon_tables"),
    url(r'^characters/(?P<character_id>\d+)/misc/$', "characters.json.misc", name="characters-misc"),
    
    #Character Creation
    url(r'^characters/new/$', "characters.creation.new", name="characters-new"),
    url(r'^characters/(?P<character_id>\d+)/$', "characters.views.character", name="characters"),
    url(r'^characters/(?P<character_id>\d+)/personal-update/$', "characters.creation.personal_update", name="characters-personal-update"),
    url(r'^characters/(?P<character_id>\d+)/first_level/$', "characters.views.first_level", name="characters-first-levels"),
    url(r'^characters/(?P<character_id>\d+)/create/$', "characters.creation.create", name="characters-create"),
    url(r'^characters/(?P<character_id>\d+)/level_update/$', "characters.creation.level_update", name="characters-level-update"),
    url(r'^characters/(?P<character_id>\d+)/weaponsTablesAdd/$', "characters.creation.weaponTablesAdd", name="characters-weaponTablesAdd"),
    url(r'^characters/(?P<character_id>\d+)/weaponsTablesRemove/$', "characters.creation.weaponTablesRemove", name="characters-weaponTablesRemove"),
    url(r'^characters/(?P<character_id>\d+)/save/$', "characters.creation.save", name="characters-save"),

    #Social Auth App
    url(r'', include('social_auth.urls')),
    # url(r'^tf2rpg/', include('tf2rpg.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)
