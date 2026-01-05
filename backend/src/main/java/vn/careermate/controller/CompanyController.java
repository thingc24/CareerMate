package vn.careermate.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.careermate.model.Company;
import vn.careermate.service.CompanyService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/companies")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping
    public ResponseEntity<Page<Company>> getAllCompanies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(companyService.getAllCompanies(pageable));
    }

    @GetMapping("/top")
    public ResponseEntity<List<Company>> getTopCompanies(
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(companyService.getTopCompanies(limit));
    }

    @GetMapping("/{companyId}")
    public ResponseEntity<Company> getCompany(@PathVariable UUID companyId) {
        return ResponseEntity.ok(companyService.getCompanyById(companyId));
    }
}

