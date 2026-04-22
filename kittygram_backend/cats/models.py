from django.contrib.auth import get_user_model
from django.db import models
from django.core.exceptions import ValidationError


User = get_user_model()

class Duel(models.Model):
    cat_a = models.ForeignKey('Cat', on_delete=models.CASCADE, related_name='duels_as_a')
    cat_b = models.ForeignKey('Cat', on_delete=models.CASCADE, related_name='duels_as_b')
    status = models.CharField(max_length=10, choices=[('active', 'Активна'), ('closed', 'Завершена')], default='active')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_duels')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Дуэль: {self.cat_a.name} vs {self.cat_b.name}'


class Vote(models.Model):
    """Голос пользователя за кота в дуэли"""
    duel = models.ForeignKey(Duel, on_delete=models.CASCADE, related_name='votes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='votes')
    chosen_cat = models.ForeignKey(
        'Cat', on_delete=models.CASCADE, verbose_name='Выбранный кот'
    )
    voted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('duel', 'user')  # один пользователь – один голос за дуэль
        verbose_name = 'Голос'
        verbose_name_plural = 'Голоса'

    def clean(self):
        if self.chosen_cat not in [self.duel.cat_a, self.duel.cat_b]:
            raise ValidationError('Можно голосовать только за одного из участников дуэли')
        if self.duel.status != 'active':
            raise ValidationError('Дуэль уже завершена, голосование невозможно')

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.user.username} за {self.chosen_cat.name} в дуэли {self.duel.id}'


class Achievement(models.Model):
    name = models.CharField(max_length=64)

    def __str__(self):
        return self.name


class Cat(models.Model):
    name = models.CharField(max_length=16)
    color = models.CharField(max_length=16)
    birth_year = models.IntegerField()
    owner = models.ForeignKey(
        User, related_name='cats', 
        on_delete=models.CASCADE
        )
    achievements = models.ManyToManyField(Achievement, through='AchievementCat')
    image = models.ImageField(
        upload_to='cats/images/', 
        null=True,  
        default=None
        )

    def __str__(self):
        return self.name


class AchievementCat(models.Model):
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    cat = models.ForeignKey(Cat, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.achievement} {self.cat}'