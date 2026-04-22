import base64
import datetime as dt

from django.core.files.base import ContentFile
from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator
import webcolors

from .models import Achievement, AchievementCat, Cat, Duel, Vote

class DuelSerializer(serializers.ModelSerializer):
    cat_a_name = serializers.StringRelatedField(source='cat_a', read_only=True)
    cat_b_name = serializers.StringRelatedField(source='cat_b', read_only=True)
    created_by_username = serializers.StringRelatedField(source='created_by', read_only=True)
    votes_a = serializers.SerializerMethodField()
    votes_b = serializers.SerializerMethodField()

    class Meta:
        model = Duel
        fields = [
            'id', 'cat_a', 'cat_b', 'cat_a_name', 'cat_b_name',
            'status', 'created_by', 'created_by_username',
            'created_at', 'updated_at', 'votes_a', 'votes_b'
        ]
        read_only_fields = ['created_by', 'status', 'created_at', 'updated_at']

    def get_votes_a(self, obj):
        return obj.votes.filter(chosen_cat=obj.cat_a).count()

    def get_votes_b(self, obj):
        return obj.votes.filter(chosen_cat=obj.cat_b).count()

    def validate(self, data):
        """Валидация на уровне сериализатора"""
        cat_a = data.get('cat_a')
        cat_b = data.get('cat_b')
        
        if cat_a == cat_b:
            raise serializers.ValidationError('Кот не может сражаться сам с собой')
        
        if cat_a.owner == cat_b.owner:
            raise serializers.ValidationError('Коты должны принадлежать разным владельцам')
        
        return data

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote
        fields = ['id', 'chosen_cat', 'voted_at']
        read_only_fields = ['user', 'voted_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class DuelResultSerializer(serializers.Serializer):
    """Сериализатор для результатов дуэли"""
    duel_id = serializers.IntegerField()
    cat_a = serializers.StringRelatedField()
    cat_b = serializers.StringRelatedField()
    votes_a = serializers.IntegerField()
    votes_b = serializers.IntegerField()
    winner = serializers.StringRelatedField(allow_null=True)
    status = serializers.CharField()

class Hex2NameColor(serializers.Field):
    def to_representation(self, value):
        return value
    
    def to_internal_value(self, data):
        try:
            data = webcolors.hex_to_name(data)
        except ValueError:
            raise serializers.ValidationError('Для этого цвета нет имени')
        return data


class AchievementSerializer(serializers.ModelSerializer):
    achievement_name = serializers.CharField(source='name')

    class Meta:
        model = Achievement
        fields = ('id', 'achievement_name')


class Base64ImageField(serializers.ImageField):
    def to_internal_value(self, data):
        if isinstance(data, str) and data.startswith('data:image'):
            format, imgstr = data.split(';base64,')
            ext = format.split('/')[-1]
            data = ContentFile(base64.b64decode(imgstr), name='temp.' + ext)
        return super().to_internal_value(data)


class CatSerializer(serializers.ModelSerializer):
    achievements = AchievementSerializer(required=False, many=True)
    color = Hex2NameColor()
    age = serializers.SerializerMethodField()
    image = Base64ImageField(required=False, allow_null=True)
    
    class Meta:
        model = Cat
        fields = (
            'id', 'name', 'color', 'birth_year', 'achievements', 'owner', 'age',
            'image'
        )
        read_only_fields = ('owner',)
        validators = [
            UniqueTogetherValidator(
                queryset=Cat.objects.all(),
                fields=('name', 'owner'),
                message='У вас уже есть котик с таким именем'
            )
        ]

    def get_age(self, obj):
        return dt.datetime.now().year - obj.birth_year
    
    # === ВАЛИДАЦИЯ ГОДА РОЖДЕНИЯ ===
    def validate_birth_year(self, value):
        current_year = dt.datetime.now().year
        min_year = current_year - 40
        max_year = current_year
        
        if value < min_year:
            raise serializers.ValidationError(
                f'Год рождения не может быть меньше {min_year} (котики столько не живут)'
            )
        if value > max_year:
            raise serializers.ValidationError(
                f'Год рождения не может быть в будущем (максимум {max_year})'
            )
        return value
    
    # === ВАЛИДАЦИЯ НА УРОВНЕ ОБЪЕКТА ===
    def validate(self, data):
        # Имя не должно совпадать с цветом
        if data.get('name') and data.get('color'):
            if data['name'].lower() == data['color'].lower():
                raise serializers.ValidationError(
                    {'non_field_errors': 'Имя котика не может совпадать с его цветом'}
                )
        
        # Минимальная длина имени
        if data.get('name') and len(data['name'].strip()) < 2:
            raise serializers.ValidationError(
                {'name': 'Имя котика должно содержать хотя бы 2 символа'}
            )
        
        return data
    
    def create(self, validated_data):
        if 'achievements' not in self.initial_data:
            cat = Cat.objects.create(**validated_data)
            return cat
        else:
            achievements = validated_data.pop('achievements')
            cat = Cat.objects.create(**validated_data)
            for achievement in achievements:
                current_achievement, status = Achievement.objects.get_or_create(
                    **achievement
                )
                AchievementCat.objects.create(
                    achievement=current_achievement, cat=cat
                )
            return cat
    
    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.color = validated_data.get('color', instance.color)
        instance.birth_year = validated_data.get(
            'birth_year', instance.birth_year
        )
        instance.image = validated_data.get('image', instance.image)
        if 'achievements' in validated_data:
            achievements_data = validated_data.pop('achievements')
            lst = []
            for achievement in achievements_data:
                current_achievement, status = Achievement.objects.get_or_create(
                    **achievement
                )
                lst.append(current_achievement)
            instance.achievements.set(lst)

        instance.save()
        return instance