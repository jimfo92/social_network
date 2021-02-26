from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass


class Post(models.Model):
    user = models.ForeignKey(User, null=True, on_delete=models.SET_NULL, related_name='user_posts')
    post_data = models.CharField(max_length=1000)
    timestamp = models.DateTimeField( auto_now_add=True)
    likes = models.IntegerField(default=0)

    def __str__(self) -> str:
        return f"{self.user} posts: {self.post_data} on {self.timestamp}"