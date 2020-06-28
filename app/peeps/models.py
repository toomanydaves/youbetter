from cryptography.fernet import Fernet
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_save
from django.utils.encoding import force_bytes, force_str
from secrets import token_urlsafe
import binascii
import requests

class User(AbstractUser):
    nosql_token = models.BinaryField(max_length=150)

    def get_url_for_remote_db_access(self):
        f = Fernet(force_bytes(settings.FERNET_KEY))
        password = force_str(f.decrypt(force_bytes(self.nosql_token)))
        hex_username = force_str(binascii.b2a_hex(force_bytes(self.username)))

        return 'http://' + self.username + ':' + password + '@' + settings.NOSQL['REMOTE'] + '/userdb-' + hex_username
    pass

def create_user_db(sender, instance, created, **kwargs):
    if created:
        # Add the user to CouchDB
        # couch_peruser will provision a new db whenever a user is added
        url = 'http://' + settings.NOSQL['HOST'] + '/_users/org.couchdb.user:' + instance.username
        auth = (settings.NOSQL['USER'], settings.NOSQL['PASSWORD'])
        password = token_urlsafe(12)
        json = {
            'name': instance.username,
            'password': password,
            'roles': [ ],
            'type': 'user',
        }
        response = requests.put(url, json=json, auth=auth)

        # Throw error if bad response from CouchDB
        response.raise_for_status()

        # Save encrypted db password to model
        f = Fernet(force_bytes(settings.FERNET_KEY))
        token = f.encrypt(force_bytes(password))
        instance.nosql_token = token
        instance.save()

post_save.connect(create_user_db, sender=User, weak=False)
