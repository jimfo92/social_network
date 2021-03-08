# Generated by Django 3.1.5 on 2021-03-06 11:53

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0006_relationships'),
    ]

    operations = [
        migrations.AlterField(
            model_name='relationships',
            name='user_follow',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]
