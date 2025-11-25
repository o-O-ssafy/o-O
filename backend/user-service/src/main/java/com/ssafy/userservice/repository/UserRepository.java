package com.ssafy.userservice.repository;

import com.ssafy.userservice.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByProviderId(String providerId);

    List<User> findByIdIn(List<Long> ids);
}
