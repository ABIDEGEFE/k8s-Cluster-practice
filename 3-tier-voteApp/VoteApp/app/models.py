from django.db import models

# Create your models here.
class Candidates(models.Model):
    name = models.CharField()
    party = models.CharField()