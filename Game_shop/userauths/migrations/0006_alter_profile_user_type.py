# Generated by Django 4.2 on 2025-03-13 10:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('userauths', '0005_alter_profile_user_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='user_type',
            field=models.CharField(choices=[('Admin', 'Admin'), ('Vendor', 'Vendor'), ('Customer', 'Customer')], default='Customer', max_length=255),
        ),
    ]
