# Generated by Django 3.1.5 on 2021-03-06 14:23

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0007_auto_20210306_1153'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='relationships',
            name='user_follow',
        ),
        migrations.AddField(
            model_name='relationships',
            name='user_follow',
            field=models.ManyToManyField(null=True, to=settings.AUTH_USER_MODEL),
        ),
    ]
