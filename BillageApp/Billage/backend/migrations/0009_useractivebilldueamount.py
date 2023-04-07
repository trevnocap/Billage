# Generated by Django 4.1.5 on 2023-04-02 03:25

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('backend', '0008_alter_billage_billage_image'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserActiveBillDueAmount',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('due_amount', models.DecimalField(decimal_places=2, default=0, max_digits=7)),
                ('bill_due_date', models.DateField()),
                ('active_bill', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='backend.billagebillactivebill')),
                ('linked_bill', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='backend.linkedbill')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]