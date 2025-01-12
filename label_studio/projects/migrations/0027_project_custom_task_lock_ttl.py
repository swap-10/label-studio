# Generated by Django 4.2.16 on 2024-10-29 15:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0026_auto_20231103_0020'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='custom_task_lock_ttl',
            field=models.IntegerField(default=None, help_text='Custom task lock TTL in seconds. If not set, the default value is used', null=True, verbose_name='custom_task_lock_ttl'),
        ),
    ]
