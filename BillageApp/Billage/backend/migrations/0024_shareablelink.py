# Generated by Django 4.2 on 2023-04-13 04:29

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0023_delete_invitelink'),
    ]

    operations = [
        migrations.CreateModel(
            name='ShareableLink',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('expires_at', models.DateTimeField()),
                ('billage', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='backend.billage')),
            ],
        ),
    ]