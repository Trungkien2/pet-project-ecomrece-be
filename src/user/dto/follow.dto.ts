import { IsUUID, IsOptional, IsInt, Min } from 'class-validator';

export class FollowUserDto {
  @IsUUID()
  followingId: string;
}

export class UnfollowUserDto {
  @IsUUID()
  followingId: string;
}

export class GetFollowersDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;
}

export class GetFollowingDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;
}

export class DiscoverUsersDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;
}