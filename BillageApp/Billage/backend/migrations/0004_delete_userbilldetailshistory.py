# Generated by Django 4.1.5 on 2023-03-21 02:09

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0003_alter_userbilldetailshistory_payment_method'),
    ]

    operations = [
        migrations.DeleteModel(
            name='UserBillDetailsHistory',
        ),
    ]
