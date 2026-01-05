package vn.careermate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.careermate.model.Package;

import java.util.UUID;

@Repository
public interface PackageRepository extends JpaRepository<Package, UUID> {
}

