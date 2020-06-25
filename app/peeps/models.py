from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_save

class User(AbstractUser):
    pass

def create_user_db(sender, instance, created, **kwargs):
    if created:
        #TODO connect to couch, create user and db, save url to user model
        print("create user db")

post_save.connect(create_user_db, sender=User, weak=False)
