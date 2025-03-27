from django.db import models
from django.db.models.signals import post_save
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.dispatch import receiver  # Добавляем импорт для декоратора @receiver

USER_TYPE = (
    ("Admin", "Admin"),
    ("Vendor", "Vendor"),
    ("Customer", "Customer"),
)

class User(AbstractUser):
    username = models.CharField(max_length=255, null=True, unique=True)
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

    def save(self, *args, **kwargs):
        email_username, _ = self.email.split("@")
        if not self.username:
            self.username = email_username
        super(User, self).save(*args, **kwargs)

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    image = models.ImageField(upload_to="images", default='default-user.jpg', null=True, blank=True)
    full_name = models.CharField(max_length=255,  null=True, blank=True )
    bio = models.CharField ( max_length = 1000, null=True, blank=True)
    mobile = models.CharField(max_length=255,  null=True, blank=True )
    # Оставляем только одно определение поля user_type
    user_type = models.CharField(max_length=255, choices=USER_TYPE, default="Customer")
    verified = models.BooleanField ( default = False )
    
    def __str__(self):
        return self.user.username

    def save(self, *args, **kwargs):
        if not self.full_name:
            self.full_name = self.user.username
        super(Profile, self).save(*args, **kwargs)


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

post_save.connect(create_user_profile, sender=User)
post_save.connect(save_user_profile, sender=User)

class SupportRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('resolved', 'Resolved'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)  # Может быть null для неавторизованных
    subject = models.CharField(max_length=200)
    message = models.TextField()
    user_email = models.EmailField()
    order_number = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_reply = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Support Request'
        verbose_name_plural = 'Support Requests'

    def __str__(self):
        return f"{self.subject} - {self.user_email}"

class ChatMessage(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    message = models.TextField()
    related_ticket = models.ForeignKey('SupportRequest', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'Message from {self.sender.username} to {self.receiver.username}'