insert into public.rooms (daycare_id, name)
select d.id, room.name
from public.daycares d
cross join (values ('Soles'), ('Lunas'), ('Estrellas')) as room(name)
where d.name = 'Sala Soles'
  and not exists (
    select 1
    from public.rooms existing_room
    where existing_room.daycare_id = d.id
      and existing_room.name = room.name
  );
