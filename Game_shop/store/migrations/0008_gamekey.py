# Generated by Django 4.2 on 2025-03-27 16:46

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0007_alter_wishlist_product_alter_wishlist_user'),
    ]

    operations = [
        migrations.CreateModel(
            name='GameKey',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('key', models.CharField(max_length=255, unique=True)),
                ('status', models.CharField(choices=[('available', 'Available'), ('reserved', 'Reserved'), ('sold', 'Sold')], default='available', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('order', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='game_keys', to='store.order')),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='game_keys', to='store.product')),
            ],
            options={
                'verbose_name': 'Game Key',
                'verbose_name_plural': 'Game Keys',
                'ordering': ['-created_at'],
            },
        ),
    ]
